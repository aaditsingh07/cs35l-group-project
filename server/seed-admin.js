const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new Database(path.join(__dirname, "users.db"));

const email = process.argv[2] || "admin@example.com";
const name = process.argv[3] || "Admin";
const password = process.argv[4] || "admin123";

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.error(`Error: a user with email "${email}" already exists.`);
  process.exit(1);
}

const hashedPassword = bcrypt.hashSync(password, 10);
db.prepare(
  "INSERT INTO users (name, email, password, account_type) VALUES (?, ?, ?, 'admin')"
).run(name, email, hashedPassword);

console.log(`Admin user created:`);
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log(`  Name:     ${name}`);
