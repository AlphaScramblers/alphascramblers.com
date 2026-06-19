import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/razorpay/key — frontend fetches the public key_id
router.get("/key", (req, res) => {
  return res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/razorpay/order — create an order for a session booking
router.post("/order", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId)
      return res.status(400).json({ success: false, message: "sessionId required" });

    const { db } = await connectDB();
    const session = await db.collection("sessions").findOne({ _id: new ObjectId(sessionId) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const feeRupees = parseInt(session.fee || "0", 10);
    if (!feeRupees || feeRupees <= 0)
      return res.status(400).json({ success: false, message: "This session is free, no order needed" });

    const order = await razorpay.orders.create({
      amount: feeRupees * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `sess_${sessionId}_${Date.now()}`,
      notes: { sessionId, sessionTitle: session.title },
    });

    return res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID, amount: feeRupees });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/razorpay/verify — verify signature, then create the booking
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !sessionId || !userId || !email)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    // 1. Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Signature valid — now create the booking (mirrors /api/sessions/:id/book)
    const { db } = await connectDB();
    const sessions = db.collection("sessions");
    const bookings = db.collection("bookings");

    const session = await sessions.findOne({ _id: new ObjectId(sessionId) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const existing = await bookings.findOne({ sid: sessionId, userId });
    if (existing) {
      // Already registered (e.g. duplicate click) — payment succeeded but booking exists.
      // Don't fail the request; the money is already captured.
      return res.json({ success: true, message: "Already registered for this session" });
    }

    await sessions.updateOne(
      { _id: new ObjectId(sessionId) },
      { $inc: { bookingCount: 1 } }
    );

    await bookings.insertOne({
      sid: sessionId,
      stitle: session.title,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone: phone || "",
      sessionDate: session.date || "",
      sessionTime: session.time || "",
      duration: session.duration || "",
      fee: session.fee || "0",
      payMode: "online",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      wpAdded: false,
      at: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Payment verified, booking confirmed" });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;