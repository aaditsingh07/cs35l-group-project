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

router.get("/users", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const users = db
    .prepare(`SELECT id, name FROM users WHERE id != ? ORDER BY name ASC`)
    .all(userId);
  res.json(users);
});

// GET /api/messages — get all messages for the user's conversations
router.get("/conversations", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const userConversationsIds = db
    .prepare(
      `SELECT uc.id,
              CASE WHEN uc.from_user = ? THEN u_to.name ELSE u_from.name END AS other_user_name
         FROM user_conversations uc
         JOIN users u_from ON u_from.id = uc.from_user
         JOIN users u_to ON u_to.id = uc.to_user
        WHERE uc.from_user = ? OR uc.to_user = ?`,
    )
    .all(userId, userId, userId);

  const groupId = db
    .prepare(`SELECT group_id FROM users WHERE id = ?`)
    .get(userId);
  if (!groupId.group_id) {
    return res.json({
      userConversations: userConversationsIds,
      groupConversations: [],
    });
  }
  const groupConversationsIds = db
    .prepare(`SELECT id FROM group_conversations WHERE group_id = ?`)
    .all(groupId.group_id);

  res.json({
    userConversations: userConversationsIds,
    groupConversations: groupConversationsIds,
  });
});

router.get("/conversations/:id/messages", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const conversationId = Number(req.params.id);
  const isGroup = req.query.isGroup === "true";

  if (!conversationId) {
    return res.status(400).json({ error: "Invalid conversation id." });
  }

  if (isGroup) {
    const conv = db
      .prepare(`SELECT group_id FROM group_conversations WHERE id = ?`)
      .get(conversationId);
    if (!conv) return res.status(404).json({ error: "Conversation not found." });

    const me = db.prepare(`SELECT group_id FROM users WHERE id = ?`).get(userId);
    if (!me || me.group_id !== conv.group_id) {
      return res.status(403).json({ error: "Not a member of this group." });
    }
    
    db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE group_conversation_id = ?
        AND sender_id != ?
    `).run(conversationId, userId);
    
    const messages = db
      .prepare(
        `SELECT m.id, m.content, m.created_at, m.sender_id, u.name AS sender_name
           FROM messages m
           LEFT JOIN users u ON u.id = m.sender_id
          WHERE m.group_conversation_id = ?
          ORDER BY m.created_at ASC, m.id ASC`,
      )
      .all(conversationId);
    return res.json(messages);
  }

  const conv = db
    .prepare(`SELECT from_user, to_user FROM user_conversations WHERE id = ?`)
    .get(conversationId);
  if (!conv) return res.status(404).json({ error: "Conversation not found." });
  if (conv.from_user !== userId && conv.to_user !== userId) {
    return res.status(403).json({ error: "Not a participant." });
  }
  
  db.prepare(`
    UPDATE messages
    SET is_read = 1
    WHERE user_conversation_id = ?
      AND sender_id != ?
  `).run(conversationId, userId);
  
  const messages = db
    .prepare(
      `SELECT m.id, m.content, m.created_at, m.sender_id, u.name AS sender_name
         FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.user_conversation_id = ?
        ORDER BY m.created_at ASC, m.id ASC`,
    )
    .all(conversationId);
  res.json(messages);
});

router.post("/conversations/:id/messages", requireAuth, (req, res) => {
  const userId = req.user.userId;
  const conversationId = Number(req.params.id);
  const { content, isGroup } = req.body;

  if (!conversationId) {
    return res.status(400).json({ error: "Invalid conversation id." });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message content is required." });
  }

  if (isGroup) {
    const conv = db
      .prepare(`SELECT group_id FROM group_conversations WHERE id = ?`)
      .get(conversationId);
    if (!conv) return res.status(404).json({ error: "Conversation not found." });

    const me = db.prepare(`SELECT group_id FROM users WHERE id = ?`).get(userId);
    if (!me || me.group_id !== conv.group_id) {
      return res.status(403).json({ error: "Not a member of this group." });
    }

    const result = db
      .prepare(
        `INSERT INTO messages (
          group_conversation_id,
          sender_id,
          content,
          is_read
        ) VALUES (?, ?, ?, ?)`,
      )
      .run(conversationId, userId, content.trim(), 0);

    const message = db
      .prepare(
        `SELECT m.id, m.content, m.created_at, m.sender_id, u.name AS sender_name
           FROM messages m
           LEFT JOIN users u ON u.id = m.sender_id
          WHERE m.id = ?`,
      )
      .get(result.lastInsertRowid);
    return res.json(message);
  }

  const conv = db
    .prepare(`SELECT from_user, to_user FROM user_conversations WHERE id = ?`)
    .get(conversationId);
  if (!conv) return res.status(404).json({ error: "Conversation not found." });
  if (conv.from_user !== userId && conv.to_user !== userId) {
    return res.status(403).json({ error: "Not a participant." });
  }

  const result = db
    .prepare(
      `INSERT INTO messages (
        user_conversation_id,
        sender_id,
        content,
        is_read
      ) VALUES (?, ?, ?, ?)`,
    )
    .run(conversationId, userId, content.trim(), 0);

  const message = db
    .prepare(
      `SELECT m.id, m.content, m.created_at, m.sender_id, u.name AS sender_name
         FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.id = ?`,
    )
    .get(result.lastInsertRowid);
  res.json(message);
});

router.post("/conversations", requireAuth, (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.userId;

  if (!toUserId) {
    return res.status(400).json({ error: "toUserId is required." });
  }

  const existing = db
    .prepare(
      `SELECT id FROM user_conversations WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)`,
    )
    .get(fromUserId, toUserId, toUserId, fromUserId);

  if (existing) {
    return res.status(400).json({ error: "Conversation already exists." });
  }

  const result = db
    .prepare(
      `INSERT INTO user_conversations (from_user, to_user, title, created_by) VALUES (?, ?, '', ?)`,
    )
    .run(fromUserId, toUserId, fromUserId);

  res.json({ conversationId: result.lastInsertRowid });
});

router.get("/unread-count", requireAuth, (req, res) => {
  const userId = req.user.userId;

  const result = db.prepare(`
    SELECT COUNT(*) AS count
    FROM messages m
    WHERE m.is_read = 0
      AND m.sender_id != ?
      AND (
        m.user_conversation_id IN (
          SELECT id
          FROM user_conversations
          WHERE from_user = ?
             OR to_user = ?
        )
        OR
        m.group_conversation_id IN (
          SELECT gc.id
          FROM group_conversations gc
          JOIN users u ON u.group_id = gc.group_id
          WHERE u.id = ?
        )
      )
  `).get(userId, userId, userId, userId);

  res.json({
    count: result.count,
  });
});

module.exports = router;
