const { Pool } = require('pg');

const host = process.env.PGHOST || 'db';
const port = parseInt(process.env.PGPORT || '5432', 10);
const database = process.env.PGDATABASE || 'appdb';
const user = process.env.PGUSER || 'appuser';
const password = process.env.PGPASSWORD || 'strongpassword';

const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = {
  pool,
  query,
};
