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

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri);
  }

  client = await clientPromise;
  return client;
}

/* ======================
   API HANDLER
====================== */
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ success: false, message: "No token" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await connectToDatabase();
    const db = client.db("myDatabase");

    const reports = db.collection("streamReports");
    const users = db.collection("users");

    /* ======================
       FETCH USER DETAILS
    ====================== */
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    /* ======================
       SAVE / UPDATE REPORT
    ====================== */
    if (req.method === "POST") {
      const { stream, testId, scores } = req.body;

      /*
        scores = [
          { section: "aptitude", score: 12 },
          { section: "behavior", score: 35 },
          { section: "mental", score: 28 }
        ]
      */

      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

      await reports.updateOne(
        { userId: decoded.id, testId, stream },
        {
          $set: {
            userId: decoded.id,
            testId,
            stream,

            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || null,
            mobile: user.mobile || null,

            scores,          // ✅ single array
            totalScore,

            lastGivenAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true });
    }

    /* ======================
       GET REPORT
    ====================== */
    if (req.method === "GET") {
      const { testId } = req.query;

      const report = await reports.findOne(
        { userId: decoded.id, testId },
        { sort: { lastGivenAt: -1 } }
      );

      if (!report)
        return res.json({ success: false, message: "Report not found" });

      return res.json({ success: true, report });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (error) {
    console.error("Stream report API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}