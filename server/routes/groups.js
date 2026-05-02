const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

const JWT_SECRET = "cs35l-secret-key";

// Middleware — reuse this across all protected routes
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
    .prepare("SELECT id, name, email, profile_photo FROM users WHERE group_id = ?")
    .all(user.group_id);

  res.json({ group, members });
});

// POST /groups — create a group manually (admin will use this, but scaffolding it now)
router.post("/groups", requireAuth, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Group name is required." });

  const result = db
    .prepare("INSERT INTO groups (name, description) VALUES (?, ?)")
    .run(name, description ?? null);

  res.status(201).json({ groupId: result.lastInsertRowid, name });
});


module.exports = router;