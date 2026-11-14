const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, query } = require('../db');
const authMiddleware = require('../middleware/auth');

// Protect all admin project routes
router.use(authMiddleware);

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
});

const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/app/uploads';

/* ---------------- GET ALL PROJECTS (ADMIN) ---------------- */
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      return getAdminProjectById(id, req, res);
    }

    const result = await query(
      `SELECT 
        p.id,
        p.title,
        p.slug,
        p.overview,
        p.location,
        p.project_date::text AS project_date,
        p.category,
        p.is_active,
        p.is_featured,
        p.created_at,
        p.client,
        pi.image_url
      FROM projects p
      LEFT JOIN project_images pi
        ON pi.project_id = p.id
        AND pi.display_order = 0  
      ORDER BY p.created_at DESC;`
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Admin GET projects error:', err);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/* ---------------- GET SINGLE PROJECT (ADMIN) ---------------- */
router.get('/:id', async (req, res) => {
  return getAdminProjectById(req.params.id, req, res);
});

async function getAdminProjectById(id, req, res) {
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    const projectRes = await query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const imagesRes = await query(
      `SELECT * FROM project_images WHERE project_id = $1 ORDER BY display_order ASC`,
      [projectId]
    );

    const specsRes = await query(
      `SELECT * FROM project_specifications WHERE project_id = $1 ORDER BY id ASC`,
      [projectId]
    );

    return res.status(200).json({
      ...projectRes.rows[0],
      images: imagesRes.rows,
      specifications: specsRes.rows,
    });
  } catch (err) {
    console.error('Admin GET single project error:', err);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
}

/* ---------------- CREATE PROJECT (POST) ---------------- */
router.post('/', upload.any(), async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      slug: rawSlug,
      overview,
      location,
      project_date,
      year,
      category,
      is_active,
      is_featured,
      client: clientDetails,
    } = req.body;

    const slug = (rawSlug || title || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const finalDate = project_date || (year ? `${year}-01-01` : new Date().toISOString().split('T')[0]);

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and Slug are required' });
    }

    const uploadDir = path.join(UPLOAD_ROOT, 'projects', slug);
    fs.mkdirSync(uploadDir, { recursive: true });

    await client.query('BEGIN');

    const projectRes = await client.query(
      `INSERT INTO projects
       (title, slug, overview, location, project_date, category, is_active, is_featured, client)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        title,
        slug,
        overview || '',
        location || '',
        finalDate,
        category || 'General',
        is_active === 'true' || is_active === true,
        is_featured === 'true' || is_featured === true,
        clientDetails || '',
      ]
    );

    const projectId = projectRes.rows[0].id;

    // Process images
    await processProjectImages(client, projectId, slug, req.body, req.files, title, uploadDir);

    // Process specifications
    await processProjectSpecs(client, projectId, req.body);

    await client.query('COMMIT');
    return res.status(201).json({ success: true, id: projectId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', err);
    return res.status(500).json({ error: 'Create project failed', details: err.message });
  } finally {
    client.release();
  }
});

/* ---------------- UPDATE PROJECT (PUT) ---------------- */
router.put('/:id', upload.any(), async (req, res) => {
  return handleUpdateProject(req.params.id, req, res);
});

router.put('/', upload.any(), async (req, res) => {
  const id = req.body.id || req.query.id;
  return handleUpdateProject(id, req, res);
});

async function handleUpdateProject(id, req, res) {
  const projectId = parseInt(id, 10);
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const client = await pool.connect();

  try {
    const {
      title,
      slug: rawSlug,
      overview,
      location,
      project_date,
      year,
      category,
      is_active,
      is_featured,
      client: clientDetails,
    } = req.body;

    const slug = (rawSlug || title || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const finalDate = project_date || (year ? `${year}-01-01` : null);

    const uploadDir = path.join(UPLOAD_ROOT, 'projects', slug);
    fs.mkdirSync(uploadDir, { recursive: true });

    await client.query('BEGIN');

    await client.query(
      `UPDATE projects SET
        title = $1,
        overview = $2,
        location = $3,
        project_date = COALESCE($4, project_date),
        category = $5,
        is_active = $6,
        is_featured = $7,
        client = $8
      WHERE id = $9`,
      [
        title,
        overview,
        location || '',
        finalDate,
        category,
        is_active === 'true' || is_active === true,
        is_featured === 'true' || is_featured === true,
        clientDetails || '',
        projectId,
      ]
    );

    // Clear existing images and specs before inserting updated ones
    await client.query(`DELETE FROM project_images WHERE project_id = $1`, [projectId]);
    await client.query(`DELETE FROM project_specifications WHERE project_id = $1`, [projectId]);

    await processProjectImages(client, projectId, slug, req.body, req.files, title, uploadDir);
    await processProjectSpecs(client, projectId, req.body);

    await client.query('COMMIT');
    return res.status(200).json({ success: true, id: projectId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating project:', err);
    return res.status(500).json({ error: 'Update project failed', details: err.message });
  } finally {
    client.release();
  }
}

/* ---------------- TOGGLE (PATCH) ---------------- */
router.patch('/toggle', handleToggle);
router.patch('/:id/toggle', (req, res) => {
  req.body.id = req.params.id;
  return handleToggle(req, res);
});

async function handleToggle(req, res) {
  try {
    const id = parseInt(req.body.id, 10);
    const { field, value } = req.body;

    if (!id || !field) {
      return res.status(400).json({ error: 'Missing required fields (id, field)' });
    }

    if (!['is_active', 'is_featured'].includes(field)) {
      return res.status(400).json({ error: 'Invalid field to toggle' });
    }

    await query(`UPDATE projects SET ${field} = $1 WHERE id = $2`, [value, id]);
    return res.status(200).json({ success: true, id, field, value });
  } catch (err) {
    console.error('Error in toggle:', err);
    return res.status(500).json({ error: 'Toggle failed' });
  }
}

/* ---------------- DELETE PROJECT ---------------- */
router.delete('/:id', async (req, res) => {
  return handleDelete(req.params.id, req, res);
});

router.delete('/', async (req, res) => {
  return handleDelete(req.query.id, req, res);
});

async function handleDelete(id, req, res) {
  const projectId = parseInt(id, 10);
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    await query(`DELETE FROM project_images WHERE project_id = $1`, [projectId]);
    await query(`DELETE FROM project_specifications WHERE project_id = $1`, [projectId]);
    await query(`DELETE FROM projects WHERE id = $1`, [projectId]);

    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ error: 'Delete project failed' });
  }
}

/* ---------------- HELPER: PROCESS IMAGES ---------------- */
async function processProjectImages(client, projectId, slug, body, files = [], title, uploadDir) {
  // Map files by fieldname
  const fileMap = {};
  if (Array.isArray(files)) {
    files.forEach(f => {
      fileMap[f.fieldname] = f;
    });
  }

  // Parse structured image entries from body
  const images = [];

  for (const [key, val] of Object.entries(body)) {
    const match = key.match(/images\[(\d+)\]\.(.+)/);
    if (!match) continue;
    const index = Number(match[1]);
    const field = match[2];
    images[index] = images[index] || {};
    images[index][field] = val;
  }

  // Check if direct files or fields like 'featuredImageFile' or 'galleryFiles' were passed
  if (fileMap['featuredImageFile'] || fileMap['featured_image']) {
    const f = fileMap['featuredImageFile'] || fileMap['featured_image'];
    images[0] = images[0] || {};
    images[0].file = f;
    images[0].is_featured = 'true';
    images[0].display_order = 0;
  }

  // Also check if images[0].file is in fileMap
  Object.keys(fileMap).forEach(fieldName => {
    const match = fieldName.match(/images\[(\d+)\]\.file/);
    if (match) {
      const idx = Number(match[1]);
      images[idx] = images[idx] || {};
      images[idx].file = fileMap[fieldName];
    }
  });

  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    if (!img) continue;

    let imageUrl = '';

    if (img.file && img.file.buffer) {
      const ext = path.extname(img.file.originalname) || '.jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), img.file.buffer);
      imageUrl = `/uploads/projects/${slug}/${filename}`;
    } else if (img.image_url && !img.image_url.startsWith('data:')) {
      imageUrl = img.image_url;
    }

    if (imageUrl) {
      const isFeatured = img.is_featured === 'true' || img.is_featured === true || idx === 0;
      const displayOrder = parseInt(img.display_order, 10) || idx;
      const altText = img.alt_text || title || 'Project image';

      await client.query(
        `INSERT INTO project_images
         (project_id, image_url, is_featured, display_order, alt_text)
         VALUES ($1, $2, $3, $4, $5)`,
        [projectId, imageUrl, isFeatured, displayOrder, altText]
      );
    }
  }
}

/* ---------------- HELPER: PROCESS SPECS ---------------- */
async function processProjectSpecs(client, projectId, body) {
  const specs = [];

  for (const [key, val] of Object.entries(body)) {
    const match = key.match(/specs\[(\d+)\]\.(.+)/);
    if (!match) continue;
    const index = Number(match[1]);
    const field = match[2];
    specs[index] = specs[index] || {};
    specs[index][field] = val;
  }

  // Also handle JSON specifications if sent as a JSON string
  if (typeof body.specifications === 'string') {
    try {
      const parsed = JSON.parse(body.specifications);
      if (Array.isArray(parsed)) {
        parsed.forEach((s, i) => {
          specs[i] = {
            icon_name: s.icon || s.icon_name || 'Building2',
            title: s.title,
            value: s.value,
          };
        });
      }
    } catch (e) {}
  } else if (Array.isArray(body.specifications)) {
    body.specifications.forEach((s, i) => {
      specs[i] = {
        icon_name: s.icon || s.icon_name || 'Building2',
        title: s.title,
        value: s.value,
      };
    });
  }

  for (const spec of specs) {
    if (!spec || !spec.title || !spec.value) continue;

    await client.query(
      `INSERT INTO project_specifications
       (project_id, icon_name, title, value)
       VALUES ($1, $2, $3, $4)`,
      [
        projectId,
        spec.icon_name || spec.icon || 'Building2',
        spec.title,
        spec.value,
      ]
    );
  }
}

module.exports = router;
