const express = require("express");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.use(requireAdmin);

router.get("/users/search", requireAdmin, (req, res) => {
  const q = `%${req.query.q ?? ""}%`;
  const users = db
    .prepare(
      "SELECT id, name, email, account_type, group_id FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY name ASC"
    )
    .all(q, q);
  res.json(users);
});

// GET /api/admin/users
router.get("/users", (req, res) => {
  const users = db
    .prepare("SELECT id, name, email, account_type, group_id FROM users")
    .all();
  res.json(users);
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", (req, res) => {
  const { account_type } = req.body;
  if (account_type !== "user" && account_type !== "admin") {
    return res.status(400).json({ error: "account_type must be 'user' or 'admin'." });
  }
  const result = db
    .prepare("UPDATE users SET account_type = ? WHERE id = ?")
    .run(account_type, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({ success: true });
});

// GET /api/admin/groups
router.get("/groups", (req, res) => {
  const groups = db
    .prepare(`
      SELECT g.id, g.name, g.description, g.created_at,
             COUNT(u.id) AS member_count
      FROM groups g
      LEFT JOIN users u ON u.group_id = g.id
      GROUP BY g.id
    `)
    .all();
  res.json(groups);
});

// DELETE /api/admin/groups/:id
router.delete("/groups/:id", (req, res) => {
  const groupId = req.params.id;
  db.prepare("UPDATE users SET group_id = NULL WHERE group_id = ?").run(groupId);
  const result = db.prepare("DELETE FROM groups WHERE id = ?").run(groupId);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Group not found." });
  }
  res.json({ success: true });
});

// GET /api/admin/tasks
router.get("/tasks", (req, res) => {
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
    .get();
  if (!tableExists) return res.json([]);
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

router.patch("/users/:id/group", (req, res) => {
  const { group_id } = req.body;
  if (group_id !== null && group_id !== undefined) {
    const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(group_id);
    if (!group) return res.status(404).json({ error: "Group not found." });
  }
  db.prepare("UPDATE users SET group_id = ? WHERE id = ?").run(
    group_id ?? null,
    req.params.id
  );
  res.json({ message: "User group updated." });
});

router.post("/groups", (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Group name is required." });
  const result = db
    .prepare("INSERT INTO groups (name, description) VALUES (?, ?)")
    .run(name.trim(), description?.trim() ?? null);
  res.status(201).json({ id: result.lastInsertRowid, name });
});

module.exports = router;
