import express from "express";
import crypto  from "crypto";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

const SESSIONS_WEBHOOK_SECRET = process.env.SESSIONS_RAZORPAY_WEBHOOK_SECRET;

// ── Razorpay helpers ──────────────────────
async function fetchRazorpayPayment(paymentId) {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay API keys are not configured on the server");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const resp = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!resp.ok) throw new Error("Could not reach Razorpay to confirm this payment");
  return resp.json();
}

// ── GET /api/sessions — all sessions (public) ───────────────────────────────
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

// ── POST /api/sessions — create session (admin only) ────────────────────────
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc, offlineSessionId, razorpayLink } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const session = {
      title, topic: topic || "", date, time,
      duration: duration || "1 hour",
      seats: seats || "", fee: fee || "0", desc: desc || "",
      offlineSessionId: offlineSessionId || "",
      razorpayLink: razorpayLink || "",   // ← NEW: Razorpay Payment Page / Link URL
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

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!SESSIONS_WEBHOOK_SECRET) {
      console.error("SESSIONS_RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(500).json({ success: false });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return res.status(400).json({ success: false, message: "Missing signature" });

    const rawBody = req.body; // Buffer because of express.raw()
    const expected = crypto.createHmac("sha256", SESSIONS_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn("Sessions webhook signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event !== "payment.captured" && event.event !== "payment_link.paid") {
      return res.json({ success: true, ignored: true });
    }

    let paymentId, amount, method, email, contact, sessionIdNote;
    if (event.event === "payment_link.paid") {
      const pl  = event.payload?.payment_link?.entity;
      const pay = event.payload?.payment?.entity;
      paymentId     = pay?.id || "";
      amount        = pay?.amount;
      method        = pay?.method;
      email         = pay?.email || pl?.customer?.email || "";
      contact       = pay?.contact || pl?.customer?.contact || "";
      sessionIdNote = pay?.notes?.sessionId || pl?.notes?.sessionId || "";
    } else {
      const pay = event.payload?.payment?.entity;
      paymentId     = pay?.id || "";
      amount        = pay?.amount;
      method        = pay?.method;
      email         = pay?.email || "";
      contact       = pay?.contact || "";
      sessionIdNote = pay?.notes?.sessionId || "";
    }

    if (!paymentId) return res.status(400).json({ success: false, message: "No payment ID in event" });

    const { db } = await connectDB();

    await db.collection("pendingPayments").updateOne(
      { paymentId },
      {
        $set: {
          paymentId,
          sessionId: sessionIdNote || "",   // best-effort; may be empty
          amount,
          method,
          email: (email || "").toLowerCase(),
          contact,
          verified: true,
          used: false,
          source: "sessions",               // distinguishes from offline-registrations docs
          event: event.event,
          capturedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`Sessions webhook: payment ${paymentId} captured for ${email}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("SESSIONS WEBHOOK ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

router.post("/:id/book", async (req, res) => {
  try {
    const {
      userId, name, firstName, lastName, email, phone,
    } = req.body;

    if (!userId || !email)
      return res.status(400).json({ success: false, message: "userId and email required" });

    const { db } = await connectDB();
    const sessions = db.collection("sessions");
    const bookings = db.collection("bookings");

    const session = await sessions.findOne({ _id: new ObjectId(req.params.id) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const existing = await bookings.findOne({ sid: req.params.id, userId });
    if (existing)
      return res.status(400).json({ success: false, message: "Already registered for this session" });

    // ── Payment verification (only for paid sessions) ──
    const feeAmount = parseInt(session.fee || "0");
    let verified    = false;
    let razorpayId  = "";
    let paymentMethod = "";

    if (feeAmount > 0) {
      const emailLc = (email || "").toLowerCase();
      const pending = db.collection("pendingPayments");

      let pendingDoc = await pending.findOne(
        { email: emailLc, sessionId: req.params.id, verified: true, used: false },
        { sort: { capturedAt: -1 } }
      );
      if (!pendingDoc) {
        pendingDoc = await pending.findOne(
          { email: emailLc, sessionId: "", verified: true, used: false, source: "sessions" },
          { sort: { capturedAt: -1 } }
        );
      }

      if (!pendingDoc)
        return res.status(400).json({ success: false, message: "We couldn't find a verified payment for this email yet. Please complete payment first." });

      if (pendingDoc.amount !== feeAmount * 100)
        return res.status(400).json({ success: false, message: "Payment amount does not match session fee" });

      verified = true;
      razorpayId = pendingDoc.paymentId;
      paymentMethod = pendingDoc.method || "";

      // Mark the pending payment as used so it can't be reused for another booking
      await pending.updateOne(
        { paymentId: razorpayId },
        { $set: { used: true, usedAt: new Date() } }
      );
    }

    // ── Increment booking count ──
    await sessions.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { bookingCount: 1 } }
    );

    // ── Insert booking ──
    await bookings.insertOne({
      sid:          req.params.id,
      stitle:       session.title,
      userId,
      name,
      firstName,
      lastName,
      email,
      phone:        phone || "",
      sessionDate:  session.date || "",
      sessionTime:  session.time || "",
      duration:     session.duration || "",
      fee:          session.fee || "0",
      payMode:      feeAmount > 0 ? "online" : "free",
      razorpayId,
      paymentMethod,
      paymentVerified: verified,
      wpAdded:      false,
      at:           new Date().toISOString(),
    });

    return res.json({ success: true, message: "Booking confirmed" });
  } catch (err) {
    console.error("BOOK SESSION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/verify-payment", async (req, res) => {
  try {
    const { razorpay_payment_id } = req.body;
    if (!razorpay_payment_id)
      return res.status(400).json({ success: false, message: "Missing payment ID" });

    const { db } = await connectDB();
    const session = await db.collection("sessions").findOne({ _id: new ObjectId(req.params.id) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const feeAmount = parseInt(session.fee || "0");
    if (feeAmount === 0)
      return res.json({ success: true, payment: { razorpayId: "", amount: 0 } });

    // Try webhook store first
    const pendingDoc = await db.collection("pendingPayments").findOne({
      paymentId: razorpay_payment_id,
      verified:  true,
      used:      false,
    });

    if (pendingDoc) {
      if (pendingDoc.amount !== feeAmount * 100)
        return res.status(400).json({ success: false, message: "Payment amount does not match session fee" });
      return res.json({ success: true, payment: { razorpayId: pendingDoc.paymentId, amount: pendingDoc.amount, method: pendingDoc.method } });
    }

    // Fallback — check Razorpay directly
    let rzPay;
    try {
      rzPay = await fetchRazorpayPayment(razorpay_payment_id);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Could not verify payment" });
    }
    if (rzPay.status !== "captured")
      return res.status(400).json({ success: false, message: `Payment not captured (status: ${rzPay.status})` });
    if (rzPay.amount !== feeAmount * 100)
      return res.status(400).json({ success: false, message: "Payment amount does not match session fee" });

    return res.json({ success: true, payment: { razorpayId: razorpay_payment_id, amount: rzPay.amount, method: rzPay.method } });
  } catch (err) {
    console.error("SESSION VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/check-payment-by-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });

    const { db } = await connectDB();
    const sid = req.params.id;
    const emailLc = email.toLowerCase();

    const pending = db.collection("pendingPayments");

    // Prefer an exact session match (webhook notes carried the session id)
    let payment = await pending.findOne(
      { email: emailLc, sessionId: sid, verified: true, used: false },
      { sort: { capturedAt: -1 } }
    );

    // Fallback: most recent unused payment for this email with no session
    // tag at all (Payment Page didn't pass notes through)
    if (!payment) {
      payment = await pending.findOne(
        { email: emailLc, sessionId: "", verified: true, used: false, source: "sessions" },
        { sort: { capturedAt: -1 } }
      );
    }

    if (!payment) return res.json({ success: true, paid: false });
    return res.json({
      success: true,
      paid: true,
      payment: { razorpayId: payment.paymentId, amount: payment.amount, method: payment.method },
    });
  } catch (err) {
    console.error("SESSION CHECK PAYMENT BY EMAIL ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── GET /api/sessions/:id/booked/:userId ────────────────────────────────────
router.get("/:id/booked/:userId", async (req, res) => {
  try {
    const { db } = await connectDB();
    const booking = await db.collection("bookings").findOne({
      sid: req.params.id,
      userId: req.params.userId,
    });
    return res.json({ success: true, booked: !!booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── PUT /api/sessions/:id — update session (admin only) ─────────────────────
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { title, topic, date, time, duration, seats, fee, desc, offlineSessionId, razorpayLink } = req.body;
    if (!title || !date || !time)
      return res.status(400).json({ success: false, message: "Title, date and time are required" });

    const { db } = await connectDB();
    const update = {
      title, topic: topic || "", date, time,
      duration: duration || "1 hour",
      seats: seats || "", fee: fee || "0", desc: desc || "",
      offlineSessionId: offlineSessionId || "",
      razorpayLink: razorpayLink || "",   // ← NEW
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

// ── DELETE /api/sessions/:id ─────────────────────────────────────────────────
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