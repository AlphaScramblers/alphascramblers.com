import { MongoClient } from "mongodb";
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
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await connectToDatabase();
    const db = client.db("myDatabase"); // change if needed
    const collection = db.collection("streamReports");

    /* ======================
       SAVE / UPDATE REPORT
    ====================== */
    if (req.method === "POST") {
      const {
        stream,
        testId,
        aptitudeScore,
        behaviorScore,
        mentalScore,
        totalScore
      } = req.body;

      await collection.updateOne(
        { userId: decoded.id, testId, stream },
        {
          $set: {
            userId: decoded.id,
            username: decoded.username,
            email: decoded.email,
            mobile: decoded.mobile,

            stream,
            aptitudeScore,
            behaviorScore,
            mentalScore,
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

      const report = await collection.findOne(
        { userId: decoded.id, testId },
        { sort: { lastGivenAt: -1 } }
      );

      if (!report) {
        return res.json({ success: false });
      }

      return res.json({
        success: true,
        report
      });
    }

    return res.status(405).json({ success: false });

  } catch (error) {
    console.error("Stream report API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}