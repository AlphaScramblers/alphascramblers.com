import express from "express";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users  — all registered users (no passwords)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { db } = await connectDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })  // never send passwords
      .sort({ _id: -1 })
      .toArray();

    return res.json({ success: true, users });
  } catch (err) {
    console.error("USERS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
