const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "users.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    email   TEXT    NOT NULL UNIQUE,
    password TEXT   NOT NULL,
    group_id INTEGER REFERENCES groups(id),   -- NULL = not yet grouped
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);


// Groups table
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    created_by  INTEGER REFERENCES users(id),        -- NULL = auto-assigned by system
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

module.exports = db;
