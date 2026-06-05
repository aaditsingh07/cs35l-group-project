const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

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
