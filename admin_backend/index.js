import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/users.js";
import sessionRoutes  from "./routes/sessions.js";
import bookingRoutes  from "./routes/bookings.js";

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use("/api/admin",    authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);

// ── Health check ────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "AlphaScramblers backend running ✓" }));

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
