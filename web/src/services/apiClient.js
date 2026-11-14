const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://api-service:4000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

async function getProjects(params = {}) {
  try {
    const res = await client.get('/api/projects', { params });
    return res.data || [];
  } catch (err) {
    console.error('Error fetching projects from API:', err.message);
    return [];
  }
}

async function getFeaturedProjects(limit = 3) {
  try {
    const all = await getProjects({ featured: 'true' });
    return all.slice(0, limit);
  } catch (err) {
    console.error('Error fetching featured projects:', err.message);
    return [];
  }
}

async function getProjectById(id) {
  try {
    const res = await client.get(`/api/projects/${id}`);
    return res.data || null;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    console.error(`Error fetching project ${id}:`, err.message);
    return null;
  }
}

async function getCategories() {
  try {
    const res = await client.get('/api/projects/categories');
    return res.data || [];
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    return [];
  }
}

async function checkApiHealth() {
  try {
    const res = await client.get('/health');
    return res.data;
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

module.exports = {
  getProjects,
  getFeaturedProjects,
  getProjectById,
  getCategories,
  checkApiHealth,
};
