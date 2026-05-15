const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

const JWT_SECRET = "cs35l-secret-key";

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// GET /groups/mine — get the current user's group + members
router.get("/groups/mine", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, group_id FROM users WHERE id = ?")
    .get(req.user.userId);

  if (!user.group_id) {
    return res.json({ group: null, members: [] });
  }

  const group = db
    .prepare("SELECT * FROM groups WHERE id = ?")
    .get(user.group_id);

  const members = db
    .prepare(
      "SELECT id, name, email, profile_photo FROM users WHERE group_id = ?",
    )
    .all(user.group_id);

  res.json({ group, members });
});

// POST /groups — create a group manually
router.post("/groups", requireAuth, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Group name is required." });

  const result = db
    .prepare("INSERT INTO groups (name, description) VALUES (?, ?)")
    .run(name, description ?? null);

  res.status(201).json({ groupId: result.lastInsertRowid, name });
});

// PUT /groups/mine/join — temporary route for testing group assignment
router.put("/groups/mine/join", requireAuth, (req, res) => {
  const { groupId } = req.body;
  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required." });
  }

  const group = db.prepare("SELECT id FROM groups WHERE id = ?").get(groupId);
  if (!group) {
    return res.status(404).json({ error: "Group not found." });
  }

  db.prepare("UPDATE users SET group_id = ? WHERE id = ?").run(
    groupId,
    req.user.userId,
  );

  res.json({ message: "Joined group successfully." });
});

function getUserGroupId(userId) {
  const user = db
    .prepare("SELECT group_id FROM users WHERE id = ?")
    .get(userId);
  return user?.group_id ?? null;
}

router.post("/tasks/create", requireAuth, (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const group_id = getUserGroupId(req.user.userId);

  const result = db
    .prepare(
      "INSERT INTO tasks (group_id, title, description, created_by) VALUES (?, ?, ?, ?)",
    )
    .run(group_id, title, description ?? null, req.user.userId);

  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    description: description ?? null,
    completed: 0,
    group_id,
    created_by: req.user.userId,
  });
});

router.get("/tasks/get", requireAuth, (req, res) => {
  const group_id = getUserGroupId(req.user.userId);

  const personalTasks = db
    .prepare(
      "SELECT * FROM tasks WHERE created_by = ? ORDER BY created_at DESC",
    )
    .all(req.user.userId);

  if (group_id) {
    const groupTasks = db
      .prepare(
        "SELECT * FROM tasks WHERE group_id = ? ORDER BY created_at DESC",
      )
      .all(group_id);
    res.json({ hasGroup: true, group: groupTasks, personal: personalTasks });
  } else {
    res.json({ hasGroup: false, group: [], personal: personalTasks });
  }
});

router.put("/tasks/toggle", requireAuth, (req, res) => {
  const { completed, id } = req.body;
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }
  db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(
    completed ? 1 : 0,
    id,
  );

  res.status(200).json({ id, completed });
});

router.delete("/tasks/delete", requireAuth, (req, res) => {
  const { id } = req.body;
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  res.status(200).json({ message: "Task deleted successfully." });
});

module.exports = router;
