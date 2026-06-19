import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/sessions — all sessions (public)
router.get("/", async (req, res) => {
  try {
    const { db } = await connectDB();
    const sessions = await db.collection("sessions").find({}).sort({ date: 1, time: 1 }).toArray();
    return res.json({ success: true, sessions });
  } catch (err) {
    console.error("GET SESSIONS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/sessions — create session (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc, offlineSessionId } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const session = {
      title, topic: topic || "", date, time,
      duration: duration || "1 hour",
      seats: seats || "", fee: fee || "0", desc: desc || "",
      offlineSessionId: offlineSessionId || "",
      bookingCount: 0,
      by: req.admin.name,
      at: new Date().toISOString(),
    };
    const result = await db.collection("sessions").insertOne(session);
    return res.json({ success: true, session: { ...session, _id: result.insertedId } });
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/sessions/:id/book — student books a session
router.post("/:id/book", async (req, res) => {
  try {
    const { userId, name, firstName, lastName, email, phone } = req.body;
    if (!userId || !email)
      return res.status(400).json({ success: false, message: "userId and email required" });

    const { db } = await connectDB();
    const sessions = db.collection("sessions");
    const bookings = db.collection("bookings");

    const session = await sessions.findOne({ _id: new ObjectId(req.params.id) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    // Paid sessions must go through /api/razorpay/order + /api/razorpay/verify
    const feeRupees = parseInt(session.fee || "0", 10);
    if (feeRupees > 0)
      return res.status(400).json({ success: false, message: "This session requires payment. Use the payment flow." });

    const existing = await bookings.findOne({ sid: req.params.id, userId });
    if (existing)
      return res.status(400).json({ success: false, message: "Already registered for this session" });

    await sessions.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { bookingCount: 1 } }
    );

    await bookings.insertOne({
      sid:         req.params.id,
      stitle:      session.title,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone:       phone || "",
      sessionDate: session.date || "",
      sessionTime: session.time || "",
      duration:    session.duration || "",
      fee:         session.fee || "0",
      payMode:     "free",
      wpAdded:     false,
      at:          new Date().toISOString(),
    });

    return res.json({ success: true, message: "Booking confirmed" });
  } catch (err) {
    console.error("BOOK SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/sessions/:id/booked/:userId — check if user already booked
router.get("/:id/booked/:userId", async (req, res) => {
  try {
    const { db } = await connectDB();
    const booking = await db.collection("bookings").findOne({
      sid: req.params.id,
      userId: req.params.userId
    });
    return res.json({ success: true, booked: !!booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/sessions/:id — update session (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc, offlineSessionId } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const update = {
      title, topic: topic || "", date, time,
      duration: duration || "1 hour",
      seats: seats || "", fee: fee || "0", desc: desc || "",
      offlineSessionId: offlineSessionId || "",
      editedBy: req.admin.name,
      editedAt: new Date().toISOString(),
    };
    const result = await db.collection("sessions").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, session: { _id: req.params.id, ...update } });
  } catch (err) {
    console.error("UPDATE SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/sessions/:id — delete session (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { db } = await connectDB();
    const result = await db.collection("sessions").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
