const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// TODO: Placeholder
const JWT_SECRET = "cs35l-secret-key";

// signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email is already taken
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    return res
      .status(409)
      .json({ error: "An account with that email already exists." });
  }

  // Encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = db
    .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    .run(name, email, hashedPassword);

  const token = jwt.sign(
    { userId: result.lastInsertRowid, email },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.status(201).json({ token, name, email });
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Look up the user
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Compare the submitted password against the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, account_type: user.account_type },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({ token, name: user.name, email: user.email, account_type: user.account_type });
});

module.exports = router;
