const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const JWT_SECRET = "cs35l-secret-key";

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
}

router.get("/meetings", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT group_id FROM users WHERE id = ?")
    .get(req.user.userId);

  const meetings = db
    .prepare(
      "SELECT * FROM meetings WHERE group_id = ? ORDER BY meeting_time ASC"
    )
    .all(user.group_id);

  res.json(meetings);
});

router.post("/meetings", requireAuth, (req, res) => {
  const { title, meeting_time } = req.body;

  const user = db
    .prepare("SELECT group_id FROM users WHERE id = ?")
    .get(req.user.userId);

  const result = db
    .prepare(
      `INSERT INTO meetings
       (title, meeting_time, group_id, created_by)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      title,
      meeting_time,
      user.group_id,
      req.user.userId
    );

  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    meeting_time
  });
});

router.delete("/meetings/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM meetings WHERE id = ?").run(req.params.id);

  res.json({ success: true });
});

module.exports = router;
