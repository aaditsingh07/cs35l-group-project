const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const adminRoutes = require("./routes/admin");
const tasksRoutes = require("./routes/tasks");  

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", groupRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", tasksRoutes);  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});