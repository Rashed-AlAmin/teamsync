const express = require("express");
const cors = require("cors");

const workspaceRoutes = require("./routes/workspaceRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 1. Global Middleware
// Updated CORS for production security
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 3. Public Routes
app.get("/", (req, res) => {
  res.send("TeamSync API running");
});

// 4. Feature Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);

// 6. Export 
module.exports = app;