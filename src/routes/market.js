// src/routes/market.js
import express from 'express';
import pg from 'pg';

const router = express.Router();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.get('/candles', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', interval = '1m', limit = 500 } = req.query;
    const q = `
      SELECT symbol, $2 AS interval, (EXTRACT(EPOCH FROM ts) * 1000)::bigint AS open_time,
             open, high, low, close, volume
      FROM prices
      WHERE symbol = $1
      ORDER BY ts DESC
      LIMIT $3
    `;
    const { rows } = await pool.query(q, [symbol, interval, limit]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;