const express = require('express');
const router = express.Router();
const apiClient = require('../services/apiClient');

router.get('/', async (req, res) => {
  const apiHealth = await apiClient.checkApiHealth();
  const isHealthy = apiHealth && apiHealth.status === 'ok';

  if (isHealthy) {
    return res.status(200).json({
      status: 'ok',
      service: 'web',
      api: apiHealth,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: 'degraded',
    service: 'web',
    api: apiHealth,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
