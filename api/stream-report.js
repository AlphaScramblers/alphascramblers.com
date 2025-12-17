import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/* ======================
   MongoDB Connection
====================== */
if (!mongoose.connection.readyState) {
  await mongoose.connect(process.env.MONGODB_URI);
}

/* ======================
   Schema
====================== */
const StreamReportSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,

  username: String,
  email: String,
  mobile: String,

  stream: String,
  testId: String,

  aptitudeScore: Number,
  behaviorScore: Number,
  mentalScore: Number,
  totalScore: Number,

  lastGivenAt: {
    type: Date,
    default: Date.now
  }
});

StreamReportSchema.index(
  { userId: 1, testId: 1 },
  { unique: true }
);

const StreamReport =
  mongoose.models.StreamReport ||
  mongoose.model("StreamReport", StreamReportSchema);

/* ======================
   API HANDLER
====================== */
export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

      await StreamReport.updateOne(
        { userId: decoded.id, testId },
        {
          $set: {
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

      return res.json({ success: true });
    }

    /* ======================
       GET REPORT
    ====================== */
    if (req.method === "GET") {
      const { testId } = req.query;

      const report = await StreamReport.findOne({
        userId: decoded.id,
        testId
      });

      if (!report) {
        return res.json({ success: false });
      }

      return res.json({
        success: true,
        report
      });
    }

    return res.status(405).json({ success: false });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}