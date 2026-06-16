// /api/offline-registrations.js
// Single Vercel serverless function — handles all offline registration ops
// GET    /api/offline-registrations          → list all
// GET    /api/offline-registrations?id=xxx   → single record
// POST   /api/offline-registrations          → create new registration
// PATCH  /api/offline-registrations?id=xxx  → update (verified, etc.)

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;          // set in Vercel env vars
const DB_NAME   = process.env.DB_NAME || 'alphascramblers';
const COLL      = 'offline_registrations';

// CORS headers — allow your domain + localhost
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URI, { maxPoolSize: 5 });
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(CORS).end();
  }

  // Set CORS on all responses
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const db   = await getDb();
    const coll = db.collection(COLL);
    const { id } = req.query;

    // ── GET ─────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id) {
        const doc = await coll.findOne({ _id: new ObjectId(id) });
        if (!doc) return res.status(404).json({ message: 'Not found' });
        return res.status(200).json({ registration: doc });
      }
      // List — optionally filter by sessionId
      const filter = req.query.sessionId ? { sessionId: req.query.sessionId } : {};
      const docs = await coll.find(filter).sort({ at: -1 }).toArray();
      return res.status(200).json({ registrations: docs });
    }

    // ── POST — create new registration ──────────────────────────────────────
    if (req.method === 'POST') {
      const {
        name, parentName, phone, email, class: cls, school,
        payMode, txnId, razorpayId,
        sessionId, sessionTitle, sessionDate, at,
      } = req.body;

      // Basic validation
      if (!name || !parentName || !phone || !cls || !school || !sessionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }

      // Check for duplicate (same phone + session)
      const dup = await coll.findOne({ phone, sessionId });
      if (dup) {
        return res.status(409).json({ message: 'This number is already registered for this session.' });
      }

      // Razorpay registrations are auto-verified
      const verified = payMode === 'razorpay' ? true : false;

      const doc = {
        name: name.trim(),
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        class: cls,
        school: school.trim(),
        payMode: payMode || 'offline',
        txnId: (txnId || '').trim(),
        razorpayId: (razorpayId || '').trim(),
        sessionId,
        sessionTitle: sessionTitle || '',
        sessionDate: sessionDate || '',
        verified,
        at: at || new Date().toISOString(),
        createdAt: new Date(),
      };

      const result = await coll.insertOne(doc);
      return res.status(201).json({ message: 'Registered successfully', id: result.insertedId, registration: { ...doc, _id: result.insertedId } });
    }

    // ── PATCH — update a registration (verify/unverify) ──────────────────────
    if (req.method === 'PATCH') {
      if (!id) return res.status(400).json({ message: 'id is required' });

      const updates = {};
      if (typeof req.body.verified === 'boolean') updates.verified = req.body.verified;
      if (req.body.txnId !== undefined) updates.txnId = req.body.txnId;

      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: 'Nothing to update' });
      }

      updates.updatedAt = new Date();
      const result = await coll.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      if (!result) return res.status(404).json({ message: 'Registration not found' });
      return res.status(200).json({ message: 'Updated', registration: result });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (err) {
    console.error('offline-registrations error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}
