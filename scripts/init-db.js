// scripts/init-db.js
const Database = require('better-sqlite3');
const db = new Database('tokens.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    email TEXT,
    expires_at INTEGER NOT NULL
  )
`).run();

console.log("Tabela creată!");
