const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "users.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'user',  -- 'user' or 'admin'
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

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT,
    completed   INTEGER NOT NULL DEFAULT 0,
    user_id     INTEGER REFERENCES users(id),
    group_id    INTEGER REFERENCES groups(id),
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

module.exports = db;
