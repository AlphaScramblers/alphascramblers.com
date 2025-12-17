import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

/* ======================
   MongoDB Connection
====================== */
async function connectToDatabase() {
  if (client) return client;
  if (!clientPromise) clientPromise = MongoClient.connect(uri);
  client = await clientPromise;
  return client;
}

/* ======================
   API HANDLER
====================== */
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await connectToDatabase();
    const db = client.db("myDatabase");

    const users = db.collection("users");
    const reports = db.collection("streamReports");

    /* ======================
       SAVE / UPDATE REPORT
    ====================== */
    if (req.method === "POST") {

  const { stream, testId, scores } = req.body;

  if (!Array.isArray(scores)) {
    return res.status(400).json({
      success: false,
      message: "Scores array is required"
    });
  }

  // ✅ Calculate totalScore from scores array
  const totalScore = scores.reduce(
    (sum, s) => sum + Number(s.score || 0),
    0
  );

  // ✅ Fetch user details (source of truth)
  const user = await users.findOne({
    _id: new ObjectId(decoded.id)
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  await reports.updateOne(
    {
      userId: decoded.id,
      testId
    },
    {
      $set: {
        userId: decoded.id,
        testId,
        stream,

        username: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || null,
        mobile: user.mobileno || null,

        scores,                 // ✅ NEW STRUCTURE
        totalScore,             // ✅ recalculated every time
        lastGivenAt: new Date() // ✅ updated on retake
      }
    },
    { upsert: true }           // ✅ overwrite on retake
  );

  return res.status(200).json({ success: true });
}

    /* ======================
       GET REPORT
    ====================== */
    if (req.method === "GET") {
      const { testId } = req.query;

      const report = await reports.findOne({
        userId: decoded.id,
        testId
      });

      if (!report) {
        return res.json({ success: false });
      }

      return res.json({ success: true, report });
    }

    return res.status(405).json({ success: false });

  } catch (error) {
    console.error("Stream report API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}