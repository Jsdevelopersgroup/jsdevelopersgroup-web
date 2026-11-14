const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://api-service:4000';

function getHeaders(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (process.env.ADMIN_SECRET_KEY) {
    headers['x-admin-secret'] = process.env.ADMIN_SECRET_KEY;
  }
  return headers;
}

async function login(email, password) {
  const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
  return res.data;
}

async function verifyToken(token) {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
      headers: getHeaders(token),
    });
    return res.data && res.data.authenticated;
  } catch (err) {
    return false;
  }
}

async function getAllProjects(token) {
  const res = await axios.get(`${API_BASE_URL}/api/admin/projects`, {
    headers: getHeaders(token),
  });
  return res.data || [];
}

async function getProjectById(id, token) {
  const res = await axios.get(`${API_BASE_URL}/api/admin/projects/${id}`, {
    headers: getHeaders(token),
  });
  return res.data || null;
}

async function toggleProject(id, field, value, token) {
  const res = await axios.patch(
    `${API_BASE_URL}/api/admin/projects/toggle`,
    { id, field, value },
    { headers: getHeaders(token) }
  );
  return res.data;
}

async function deleteProject(id, token) {
  const res = await axios.delete(`${API_BASE_URL}/api/admin/projects/${id}`, {
    headers: getHeaders(token),
  });
  return res.data;
}

async function forwardMultipart(method, path, data, headers, token) {
  const reqHeaders = {
    ...headers,
    ...getHeaders(token),
  };
  const res = await axios({
    method,
    url: `${API_BASE_URL}${path}`,
    data,
    headers: reqHeaders,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return res.data;
}

async function checkApiHealth() {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`);
    return res.data;
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

module.exports = {
  login,
  verifyToken,
  getAllProjects,
  getProjectById,
  toggleProject,
  deleteProject,
  forwardMultipart,
  checkApiHealth,
};
