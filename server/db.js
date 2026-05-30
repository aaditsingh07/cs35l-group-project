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
    group_id INTEGER REFERENCES groups(id),
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

// Tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id    INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    description TEXT,
    title       TEXT    NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
    created_by  INTEGER REFERENCES users(id),        -- NULL = auto-assigned by system
    created_at  TEXT    DEFAULT (datetime('now')),
    comments    TEXT  -- JSON string of comments (array of { user_id, comment, timestamp })
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS group_conversations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id    INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    created_by  INTEGER REFERENCES users(id),        -- NULL = auto-assigned by system
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_conversations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    created_by  INTEGER REFERENCES users(id),        -- NULL = auto-assigned by system
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    group_conversation_id INTEGER REFERENCES group_conversations(id) ON DELETE CASCADE,
    user_conversation_id INTEGER REFERENCES user_conversations(id) ON DELETE CASCADE,
    sender_id   INTEGER REFERENCES users(id),
    content     TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

const messageCols = db.prepare(`PRAGMA table_info(messages)`).all();
const messageColNames = messageCols.map((c) => c.name);
if (!messageColNames.includes("sender_id")) {
  db.exec(`ALTER TABLE messages ADD COLUMN sender_id INTEGER REFERENCES users(id)`);
}
if (!messageColNames.includes("group_conversation_id")) {
  db.exec(
    `ALTER TABLE messages ADD COLUMN group_conversation_id INTEGER REFERENCES group_conversations(id)`,
  );
  if (messageColNames.includes("group_id")) {
    db.exec(`UPDATE messages SET group_conversation_id = group_id WHERE group_conversation_id IS NULL`);
  }
}
if (!messageColNames.includes("user_conversation_id")) {
  db.exec(
    `ALTER TABLE messages ADD COLUMN user_conversation_id INTEGER REFERENCES user_conversations(id)`,
  );
  if (messageColNames.includes("user_id")) {
    db.exec(`UPDATE messages SET user_conversation_id = user_id WHERE user_conversation_id IS NULL`);
  }
}

db.exec(`
  update users set group_id = null where group_id not in (select id from groups);
`);

db.exec(`
  update tasks set group_id = null where group_id not in (select id from groups);
`);

db.exec(`
  update group_conversations set group_id = null where group_id not in (select id from groups);
`);

db.exec(`
  update user_conversations set from_user = null where from_user not in (select id from users);
`);

db.exec(`
  update user_conversations set to_user = null where to_user not in (select id from users);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
