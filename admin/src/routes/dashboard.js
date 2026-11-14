const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const apiClient = require('../services/apiClient');
const requireAdminAuth = require('../middleware/auth');

router.use(requireAdminAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Admin Dashboard - Projects listing
router.get(['/', '/admin/projects'], async (req, res) => {
  try {
    const projects = await apiClient.getAllProjects(req.token);
    res.render('projects', {
      title: 'Admin Projects | Vertex Construction Group',
      projects,
    });
  } catch (err) {
    console.error('Error fetching admin projects:', err.message);
    res.render('projects', {
      title: 'Admin Projects | Vertex Construction Group',
      projects: [],
      error: 'Failed to load projects from API',
    });
  }
});

// Single project details for edit modal
router.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await apiClient.getProjectById(req.params.id, req.token);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// Toggle is_active or is_featured
router.patch('/api/projects/:id/toggle', async (req, res) => {
  try {
    const { field, value } = req.body;
    const result = await apiClient.toggleProject(req.params.id, field, value, req.token);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.response?.data?.error || 'Toggle failed' });
  }
});

// Delete project
router.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await apiClient.deleteProject(req.params.id, req.token);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.response?.data?.error || 'Delete failed' });
  }
});

// Create project (POST)
router.post('/api/projects', upload.any(), async (req, res) => {
  try {
    const form = new FormData();

    // Append regular fields
    for (const [key, value] of Object.entries(req.body)) {
      form.append(key, value);
    }

    // Append uploaded files
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        form.append(file.fieldname, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    const result = await apiClient.forwardMultipart(
      'POST',
      '/api/admin/projects',
      form,
      form.getHeaders(),
      req.token
    );

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error in POST /api/projects forward:', err.message);
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message || 'Creation failed';
    return res.status(status).json({ error });
  }
});

// Update project (PUT)
router.put('/api/projects/:id', upload.any(), async (req, res) => {
  try {
    const form = new FormData();

    for (const [key, value] of Object.entries(req.body)) {
      form.append(key, value);
    }

    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        form.append(file.fieldname, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    const result = await apiClient.forwardMultipart(
      'PUT',
      `/api/admin/projects/${req.params.id}`,
      form,
      form.getHeaders(),
      req.token
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in PUT /api/projects forward:', err.message);
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message || 'Update failed';
    return res.status(status).json({ error });
  }
});

module.exports = router;
