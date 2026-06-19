import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/users.js";
import sessionRoutes  from "./routes/sessions.js";
import bookingRoutes  from "./routes/bookings.js";
import offlineRegistrationRoutes from "./routes/offlineRegistrations.js";
import razorpayRouter from "./routes/razorpay.js";

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Must be registered BEFORE express.json() — the webhook's HMAC check needs
// the untouched raw body, and express.json() would otherwise consume the
// request stream first and leave req.body empty by the time the route's
// own express.raw() middleware runs.
app.use("/api/offline-registrations/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use("/api/admin",    authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/offline-registrations", offlineRegistrationRoutes);
app.use("/api/razorpay", razorpayRouter);

// ── Health check ────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "AlphaScramblers backend running ✓" }));

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));