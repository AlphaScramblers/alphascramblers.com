import express from "express";
import crypto  from "crypto";
import jwt     from "jsonwebtoken";
import Razorpay from "razorpay";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/mongo.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

const SESSIONS_WEBHOOK_SECRET = process.env.SESSIONS_RAZORPAY_WEBHOOK_SECRET;

// ── Verify the user's own JWT (separate from adminAuth) ───────────────────────
function requireUser(req, res, next) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Please log in" });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

// ── Razorpay client ───────────────────────────────────────────────────────────
// NOTE: these weren't defined in the file you pasted — if you already declare
// KEY_ID / KEY_SECRET / razorpay elsewhere in your real file, delete this block
// and just drop the new routes below into your existing file.
const KEY_ID     = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const razorpay   = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

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
      // razorpayLink is no longer used by the registration page (it now uses
      // the Checkout popup via /create-order), kept only for backward compat
      // in case your admin UI still has the field.
      razorpayLink: razorpayLink || "",
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

// ── POST /api/sessions/:id/create-order ──────────────────────────────────────
// Creates a Razorpay Order sized to this session's fee. Works for ANY session
// with a fee > 0 — no per-session setup needed in the Razorpay dashboard.
router.post("/:id/create-order", requireUser, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid session id" });

    const { db } = await connectDB();
    const session = await db.collection("sessions").findOne({ _id: new ObjectId(req.params.id) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const feeAmount = parseInt(session.fee || "0");
    if (feeAmount <= 0)
      return res.status(400).json({ success: false, message: "This session is free — no payment needed" });

    const order = await razorpay.orders.create({
      amount:   feeAmount * 100,
      currency: "INR",
      receipt:  `sess_${req.params.id}_${Date.now()}`,
      notes: {
        sessionId:    req.params.id,
        sessionTitle: session.title,
        userId:       req.userId,
        email:        email.toLowerCase(),
        name:         name || "",
        phone:        phone || "",
      },
    });

    return res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      KEY_ID,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ success: false, message: "Could not start payment" });
  }
});

// ── POST /api/sessions/:id/verify-payment ────────────────────────────────────
// Verifies a Checkout popup result by signature (HMAC of order_id|payment_id
// using your key secret) — this is cryptographic proof from Razorpay, the
// client can't forge it. We then pull the order back from Razorpay directly
// (never trust client-sent amount/sessionId) and record it in pendingPayments
// so the existing /:id/book route picks it up exactly as it does for webhooks.
router.post("/:id/verify-payment", requireUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ success: false, message: "Missing payment details" });
    if (!KEY_SECRET)
      return res.status(500).json({ success: false, message: "Razorpay is not configured on the server" });

    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigBuf = Buffer.from(razorpay_signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf))
      return res.status(400).json({ success: false, message: "Payment signature could not be verified" });

    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Could not confirm payment with Razorpay" });
    }

    const { db } = await connectDB();
    const session = await db.collection("sessions").findOne({ _id: new ObjectId(req.params.id) });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    const feeAmount = parseInt(session.fee || "0");
    if (order.notes?.sessionId !== req.params.id || order.amount !== feeAmount * 100)
      return res.status(400).json({ success: false, message: "Payment does not match this session" });

    if (order.notes?.userId !== req.userId)
      return res.status(403).json({ success: false, message: "This payment does not belong to your account" });

    await db.collection("pendingPayments").updateOne(
      { paymentId: razorpay_payment_id },
      {
        $set: {
          paymentId:  razorpay_payment_id,
          orderId:    razorpay_order_id,
          sessionId:  req.params.id,
          amount:     order.amount,
          userId:     req.userId,
          email:      (order.notes?.email || "").toLowerCase(),
          contact:    order.notes?.phone || "",
          verified:   true,
          used:       false,
          source:     "checkout-direct",
          capturedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.json({ success: true, payment: { razorpayId: razorpay_payment_id, amount: order.amount } });
  } catch (err) {
    console.error("SESSION VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/sessions/webhook ────────────────────────────────────────────────
// Kept as a reconciliation safety net (e.g. browser closed mid-flow before
// /verify-payment fired). Not required for the normal Checkout popup path
// anymore, since that's verified synchronously above.
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

router.post("/:id/book", requireUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, firstName, lastName, email, phone } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "email required" });

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

      // Prefer a payment tied to this exact account (normal Checkout popup flow)
      let pendingDoc = await pending.findOne(
        { userId, sessionId: req.params.id, verified: true, used: false },
        { sort: { capturedAt: -1 } }
      );
      // Fall back to email match — covers webhook-sourced payments, which
      // can't carry userId since Razorpay doesn't know your accounts
      if (!pendingDoc) {
        pendingDoc = await pending.findOne(
          { email: emailLc, sessionId: req.params.id, verified: true, used: false },
          { sort: { capturedAt: -1 } }
        );
      }
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

// ── GET /api/sessions/:id/check-payment-by-email ─────────────────────────────
// Manual fallback only (e.g. "I paid but something glitched" support case).
// The normal Checkout popup flow no longer needs this — verification happens
// synchronously via /verify-payment.
router.get("/:id/check-payment-by-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });

    const { db } = await connectDB();
    const sid = req.params.id;
    const emailLc = email.toLowerCase();

    const pending = db.collection("pendingPayments");

    let payment = await pending.findOne(
      { email: emailLc, sessionId: sid, verified: true, used: false },
      { sort: { capturedAt: -1 } }
    );

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
router.get("/:id/booked/:userId", requireUser, async (req, res) => {
  try {
    if (req.userId !== req.params.userId)
      return res.status(403).json({ success: false, message: "Forbidden" });

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
      razorpayLink: razorpayLink || "",   // unused by the Checkout popup flow; kept for backward compat
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