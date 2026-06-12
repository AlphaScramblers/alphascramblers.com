import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/sessions — all sessions
router.get("/", async (req, res) => {
  try {
    const { db } = await connectDB();
    const sessions = await db
      .collection("sessions")
      .find({})
      .sort({ date: 1, time: 1 })
      .toArray();
    return res.json({ success: true, sessions });
  } catch (err) {
    console.error("GET SESSIONS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/sessions — create a new session (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const session = {
      title,
      topic:    topic    || "",
      date,
      time,
      duration: duration || "1 hour",
      seats:    seats    || "",
      fee:      fee      || "0",
      desc:     desc     || "",
      by:       req.admin.name,
      at:       new Date().toISOString(),
    };

    const result = await db.collection("sessions").insertOne(session);
    return res.json({ success: true, session: { ...session, _id: result.insertedId } });
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/sessions/:id — update a session (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const update = {
      title, topic: topic || "", date, time,
      duration: duration || "1 hour",
      seats: seats || "",
      fee: fee || "0",
      desc: desc || "",
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

// DELETE /api/sessions/:id — delete a session (admin only)
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
