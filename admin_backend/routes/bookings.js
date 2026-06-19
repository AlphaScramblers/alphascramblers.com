import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/bookings — all bookings
router.get("/", adminAuth, async (req, res) => {
  try {
    const { db } = await connectDB();
    const bookings = await db.collection("bookings").find({}).sort({ at: -1 }).toArray();
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/bookings/:id/wp — toggle WhatsApp added status
router.patch("/:id/wp", adminAuth, async (req, res) => {
  try {
    const { wpAdded } = req.body;
    const { db } = await connectDB();

    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { wpAdded: !!wpAdded, wpBy: req.admin.name, wpAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Booking not found" });

    return res.json({ success: true });
  } catch (err) {
    console.error("WP UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;