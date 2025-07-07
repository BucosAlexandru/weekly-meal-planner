// api/generate-token.js
const Database = require('better-sqlite3');
module.exports = (req, res) => {
  // În realitate, aici validezi plata Stripe!
  const email = req.body?.email || null;
  const token = Math.random().toString(36).substring(2, 16);
  const expires_at = Date.now() + 30*24*60*60*1000; // 30 zile

  const db = new Database('tokens.db');
  db.prepare(
    'INSERT INTO tokens (token, email, expires_at) VALUES (?, ?, ?)'
  ).run(token, email, expires_at);

  res.status(200).json({ token });
};
