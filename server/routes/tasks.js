const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

// GET /api/tasks — get all tasks for the user's group
router.get("/tasks", requireAuth, (req, res) => {
  const user = db.prepare("SELECT group_id FROM users WHERE id = ?").get(req.user.userId);
  if (!user.group_id) return res.json([]);
  const tasks = db.prepare("SELECT * FROM tasks WHERE group_id = ? ORDER BY created_at DESC").all(user.group_id);
  res.json(tasks);
});

// POST /api/tasks — create a task
router.post("/tasks", requireAuth, (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });
  const user = db.prepare("SELECT group_id FROM users WHERE id = ?").get(req.user.userId);
  const result = db
    .prepare("INSERT INTO tasks (title, description, user_id, group_id) VALUES (?, ?, ?, ?)")
    .run(title, description ?? null, req.user.userId, user.group_id ?? null);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id 
router.patch("/tasks/:id", requireAuth, (req, res) => {
  const { completed } = req.body;
  const result = db
    .prepare("UPDATE tasks SET completed = ? WHERE id = ?")
    .run(completed ? 1 : 0, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Task not found." });
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete("/tasks/:id", requireAuth, (req, res) => {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Task not found." });
  res.json({ success: true });
});

module.exports = router;