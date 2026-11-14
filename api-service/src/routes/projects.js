const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all active projects (or ?id=... for single project legacy compatibility)
router.get('/', async (req, res) => {
  try {
    const { id, category, featured } = req.query;

    if (id) {
      return getSingleProject(id, req, res);
    }

    let sql = `
      SELECT 
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
      WHERE p.is_active = true
    `;

    const params = [];
    if (category && category.toLowerCase() !== 'all') {
      params.push(category);
      sql += ` AND LOWER(p.category) = LOWER($${params.length})`;
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = true`;
    }

    sql += ` ORDER BY p.created_at DESC;`;

    const result = await query(sql, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/projects:', err);
    return res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// GET /api/projects/categories - unique active project categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT category FROM projects WHERE is_active = true AND category IS NOT NULL AND TRIM(category) != '' ORDER BY category ASC`
    );
    const categories = result.rows.map(r => r.category);
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single project by ID: /api/projects/:id
router.get('/:id', async (req, res) => {
  return getSingleProject(req.params.id, req, res);
});

async function getSingleProject(id, req, res) {
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    const projectRes = await query(
      `SELECT 
        id, title, slug, overview, location, project_date::text AS project_date, 
        category, is_active, is_featured, created_at, client 
       FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const imagesRes = await query(
      `SELECT id, project_id, image_url, is_featured, display_order, alt_text 
       FROM project_images WHERE project_id = $1 ORDER BY display_order ASC`,
      [projectId]
    );

    const specsRes = await query(
      `SELECT id, project_id, icon_name, title, value 
       FROM project_specifications WHERE project_id = $1 ORDER BY id ASC`,
      [projectId]
    );

    const project = projectRes.rows[0];
    const year = project.project_date ? new Date(project.project_date).getFullYear() : null;

    return res.status(200).json({
      ...project,
      year,
      images: imagesRes.rows,
      specifications: specsRes.rows,
    });
  } catch (err) {
    console.error(`Error fetching project ${id}:`, err);
    return res.status(500).json({ error: 'Failed to fetch project details', details: err.message });
  }
}

module.exports = router;
