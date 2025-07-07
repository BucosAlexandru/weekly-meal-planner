// api/check-token.js
const Database = require('better-sqlite3');
module.exports = (req, res) => {
  const { token } = req.query;
  const db = new Database('tokens.db');
  const row = db.prepare('SELECT * FROM tokens WHERE token=?').get(token);

  if (row && row.expires_at > Date.now()) {
    res.status(200).json({ valid: true });
  } else {
    res.status(200).json({ valid: false });
  }
};
