import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const { adminDb } = await connectDB();
    const admin = await adminDb.collection("admins").findOne({ email: email.toLowerCase().trim() });

    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ success: true, token, name: admin.name, email: admin.email });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/admin/seed  ← run once to create your admin accounts, then delete or disable
// Body: { seedSecret, name, email, password }
router.post("/seed", async (req, res) => {
  try {
    const { seedSecret, name, email, password } = req.body;

    // Guard: only allow if caller knows the seed secret from .env
    if (seedSecret !== process.env.SEED_SECRET)
      return res.status(403).json({ success: false, message: "Forbidden" });

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email and password required" });

    const { adminDb } = await connectDB();
    const admins = adminDb.collection("admins");

    const exists = await admins.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(400).json({ success: false, message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await admins.insertOne({ name, email: email.toLowerCase().trim(), password: hashed, createdAt: new Date() });

    return res.json({ success: true, message: `Admin '${name}' created` });
  } catch (err) {
    console.error("SEED ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/me — verify token is still valid
router.get("/me", adminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export default router;