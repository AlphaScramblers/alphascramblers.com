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

  if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_payment_link_status || !razorpay_signature) {
    return { ok: false, message: "Missing payment details — please complete the payment again." };
  }

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

    let verified = false, razorpayId = "", txnId = "";

    if (payMode === "online") {
      const result = await verifyRazorpayPayment(req.body);
      if (!result.ok) {
        return res.status(400).json({ success: false, message: result.message });
      }
      verified = true;
      razorpayId = result.razorpayId;
      txnId = result.txnId;
    }

    const { db } = await connectDB();
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
    return res.json({ success: true, registration: { ...doc, _id: result.insertedId } });
  } catch (err) {
    console.error("CREATE OFFLINE REGISTRATION ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;