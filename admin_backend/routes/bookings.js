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

// POST /api/bookings — admin manually adds a student to a session
router.post("/", adminAuth, async (req, res) => {
  try {
    const { sid, name, email, phone } = req.body;
    if (!sid || !name || !email)
      return res.status(400).json({ success: false, message: "sid, name and email are required" });

    const { db } = await connectDB();
    const sessions = db.collection("sessions");
    const bookings = db.collection("bookings");

    const session = await sessions.findOne({ _id: new ObjectId(sid) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    // Check for duplicate booking by email within this session
    const existing = await bookings.findOne({ sid, email });
    if (existing)
      return res.status(400).json({ success: false, message: "This email is already registered for this session" });

    // Increment the session's booking count
    await sessions.updateOne(
      { _id: new ObjectId(sid) },
      { $inc: { bookingCount: 1 } }
    );

    // Create the booking document
    const booking = {
      sid,
      stitle:      session.title,
      name,
      email,
      phone:       phone || "",
      sessionDate: session.date || "",
      sessionTime: session.time || "",
      duration:    session.duration || "",
      fee:         session.fee || "0",
      wpAdded:     false,
      adminAdded:  true,
      addedBy:     req.admin.name,
      at:          new Date().toISOString(),
    };

    const result = await bookings.insertOne(booking);
    return res.json({ success: true, booking: { ...booking, _id: result.insertedId } });
  } catch (err) {
    console.error("ADMIN ADD STUDENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/bookings/:id — admin removes a booking
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { db } = await connectDB();
    const bookings = db.collection("bookings");
    const sessions = db.collection("sessions");

    const booking = await bookings.findOne({ _id: new ObjectId(req.params.id) });
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Decrement the session's booking count
    await sessions.updateOne(
      { _id: new ObjectId(booking.sid) },
      { $inc: { bookingCount: -1 } }
    );

    // Delete the booking document
    await bookings.deleteOne({ _id: new ObjectId(req.params.id) });

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
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
