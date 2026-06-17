import express from "express";
import crypto from "crypto";
import { connectDB } from "../lib/mongo.js";

const router = express.Router();

const KEY_ID     = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const FEE_PAISE  = 14900; // ₹149 in paise — update if the workshop fee changes

// ── Signature check ──────────────────────────────────────
// Razorpay Payment Page redirects sign their query params with:
//   HMAC_SHA256(payment_link_id|reference_id|status|payment_id, key_secret)
function isSignatureValid({ payment_link_id, payment_link_reference_id, payment_link_status, razorpay_payment_id, razorpay_signature }) {
  if (!KEY_SECRET || !razorpay_signature) return false;
  const payload = `${payment_link_id}|${payment_link_reference_id || ""}|${payment_link_status}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex");
  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Double-check with Razorpay's API that the payment is real ──
async function fetchRazorpayPayment(paymentId) {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay API keys are not configured on the server");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const resp = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!resp.ok) throw new Error("Could not reach Razorpay to confirm this payment");
  return resp.json();
}

// Shared verification used by both /verify-payment and the final /  POST.
// Re-derives everything from the raw Razorpay fields rather than trusting the client.
async function verifyRazorpayPayment(body) {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
  } = body;

  if (!razorpay_payment_id) {
    return { ok: false, message: "Missing payment ID — please complete the payment again." };
  }

  // Only validate Payment Link signature when those params are actually present.
  // Razorpay Payment Pages redirect with only razorpay_payment_id — no link params.
  const hasLinkParams = razorpay_payment_link_id && razorpay_payment_link_status && razorpay_signature;
  if (hasLinkParams) {
    const sigOk = isSignatureValid({
      payment_link_id: razorpay_payment_link_id,
      payment_link_reference_id: razorpay_payment_link_reference_id,
      payment_link_status: razorpay_payment_link_status,
      razorpay_payment_id,
      razorpay_signature,
    });
    if (!sigOk) {
      return { ok: false, message: "Payment signature did not match — this payment could not be verified." };
    }
    if (razorpay_payment_link_status !== "paid") {
      return { ok: false, message: `Payment is not complete yet (status: ${razorpay_payment_link_status}).` };
    }
  }

  // Always confirm directly with Razorpay API — this is the source of truth.
  let payment;
  try {
    payment = await fetchRazorpayPayment(razorpay_payment_id);
  } catch (err) {
    return { ok: false, message: err.message || "Could not confirm this payment with Razorpay." };
  }

  if (payment.status !== "captured") {
    return { ok: false, message: `Payment was not captured (status: ${payment.status}).` };
  }
  if (payment.amount !== FEE_PAISE) {
    return { ok: false, message: "Payment amount does not match the workshop fee." };
  }

  const txnId =
    payment.acquirer_data?.bank_transaction_id ||
    payment.acquirer_data?.upi_transaction_id ||
    payment.acquirer_data?.rrn ||
    "";

  return {
    ok: true,
    razorpayId: razorpay_payment_id,
    txnId,
    amount: payment.amount,
    method: payment.method,
  };
}

// POST /api/offline-registrations/verify-payment
// Called right when the page detects a Razorpay redirect, purely to flip the UI
// to "Payment Verified" and unlock the Confirm Registration button.
router.post("/verify-payment", async (req, res) => {
  try {
    const result = await verifyRazorpayPayment(req.body);
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });
    return res.json({ success: true, payment: result });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error while verifying payment" });
  }
});

// POST /api/offline-registrations/webhook
// Razorpay calls this server-to-server the moment a payment succeeds.
// We verify the webhook signature, then upsert a "pendingPayment" doc so
// the frontend can look it up after the user is redirected back.
// IMPORTANT: this route must receive the RAW body for HMAC to work.
// In index.js, mount this route BEFORE express.json() or use express.raw() here.
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(500).json({ success: false });
    }

    // Verify Razorpay webhook signature
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return res.status(400).json({ success: false, message: "Missing signature" });

    const rawBody = req.body; // Buffer because of express.raw()
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn("Webhook signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());

    // We only care about successful payment captures
    if (event.event !== "payment.captured" && event.event !== "payment_link.paid") {
      return res.json({ success: true, ignored: true });
    }

    // Extract payment details from the event payload
    let paymentId, amount, method, email, contact, paymentLinkId;
    if (event.event === "payment_link.paid") {
      const pl = event.payload?.payment_link?.entity;
      const pay = event.payload?.payment?.entity;
      paymentLinkId = pl?.id || "";
      paymentId = pay?.id || "";
      amount = pay?.amount;
      method = pay?.method;
      email = pay?.email || pl?.customer?.email || "";
      contact = pay?.contact || pl?.customer?.contact || "";
    } else {
      // payment.captured
      const pay = event.payload?.payment?.entity;
      paymentId = pay?.id || "";
      amount = pay?.amount;
      method = pay?.method;
      email = pay?.email || "";
      contact = pay?.contact || "";
      paymentLinkId = pay?.payment_link_id || "";
    }

    if (!paymentId) return res.status(400).json({ success: false, message: "No payment ID in event" });

    const { db } = await connectDB();

    // Upsert into a pendingPayments collection so the frontend can poll for it
    await db.collection("pendingPayments").updateOne(
      { paymentId },
      {
        $set: {
            paymentId,
            paymentLinkId,
            amount,
            method,
            email: email.toLowerCase(),
            contact,
            verified: true,
            used: false,          // ← keep this
            event: event.event,
            capturedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`Webhook: payment ${paymentId} captured for ${email}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

// GET /api/offline-registrations/check-payment?paymentId=pay_xxx
// Frontend polls this right after being redirected back from Razorpay.
// Returns the stored webhook data if the payment was already captured.
router.get("/check-payment", async (req, res) => {
  try {
    const { paymentId } = req.query;
    if (!paymentId) return res.status(400).json({ success: false, message: "paymentId is required" });

    const { db } = await connectDB();
    const doc = await db.collection("pendingPayments").findOne({ paymentId });
    if (!doc || !doc.verified) {
      return res.json({ success: true, found: false });
    }
    return res.json({
      success: true,
      found: true,
      payment: {
        razorpayId: doc.paymentId,
        amount: doc.amount,
        method: doc.method,
        email: doc.email,
      },
    });
  } catch (err) {
    console.error("CHECK PAYMENT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/check-payment-by-email", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required"
      });
    }

    const { db } = await connectDB();

    const payment = await db.collection("pendingPayments").findOne(
      {
        email: email.toLowerCase(),
        verified: true,
        used: false
      },
      {
        sort: { capturedAt: -1 }
      }
    );

    if (!payment) {
      return res.json({
        success: true,
        paid: false
      });
    }

    return res.json({
      success: true,
      paid: true,
      paymentId: payment.paymentId
    });

  } catch (err) {
    console.error("CHECK PAYMENT BY EMAIL ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// GET /api/offline-registrations — list all registrations (admin)
router.get("/", async (req, res) => {
  try {
    const { db } = await connectDB();
    const regs = await db.collection("offlineRegistrations").find({}).sort({ createdAt: -1 }).toArray();
    return res.json({ success: true, registrations: regs });
  } catch (err) {
    console.error("GET OFFLINE REGISTRATIONS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/offline-registrations — create a registration.
// For payMode "online", the Razorpay fields are independently re-verified here
// before anything is saved as verified — the client's word alone is never trusted.
router.post("/", async (req, res) => {
  try {
    const {
      name, parentName, phone, email, class: cls, school, payMode,
      sessionId, sessionTitle, sessionDate, at,
    } = req.body;

    if (!name || !parentName || !phone || !email || !cls || !school || !payMode) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!["cash", "online"].includes(payMode)) {
      return res.status(400).json({ success: false, message: "Invalid payment mode" });
    }

    const { db } = await connectDB();

    let verified = false;
    let razorpayId = "";
    let txnId = "";

    if (payMode === "online") {

    const paymentId = req.body.razorpay_payment_id;

    if (!paymentId) {
        return res.status(400).json({
        success: false,
        message: "Missing payment ID"
        });
    }

    const payment = await db
        .collection("pendingPayments")
        .findOne({
            paymentId,
            verified: true,
            used: false
        });

    if (!payment) {
        return res.status(400).json({
        success: false,
        message: "Payment not verified by webhook"
        });
    }

    verified = true;
    razorpayId = payment.paymentId;

    txnId =
        payment.txnId ||
        payment.bankTransactionId ||
        "";
    }
    const registrations = db.collection("offlineRegistrations");

    // Avoid double-booking the same email for the same session
    const existing = await registrations.findOne({ sessionId, email });
    if (existing) {
      return res.status(400).json({ success: false, message: "This email is already registered for this session" });
    }

    const now = new Date();
    const doc = {
      name, parentName, phone, email,
      class: cls, school, payMode,
      txnId, razorpayId,
      sessionId: sessionId || "",
      sessionTitle: sessionTitle || "",
      sessionDate: sessionDate || "",
      verified,
      at: at || now.toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await registrations.insertOne(doc);

    if (payMode === "online" && razorpayId) {
    await db.collection("pendingPayments").updateOne(
    { paymentId: razorpayId },
    {
        $set: {
        used: true,
        usedAt: new Date()
        }
    }
    );
    }

    return res.json({
    success: true,
    registration: {
        ...doc,
        _id: result.insertedId
    }
    });

    } catch (err) {
    console.error("CREATE OFFLINE REGISTRATION ERROR:", err);
    return res.status(500).json({
        success: false,
        message: "Server error"
    });
    }
    });

export default router;