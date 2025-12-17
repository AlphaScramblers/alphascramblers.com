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

// One report per user per test
StreamReportSchema.index(
  { userId: 1, testId: 1 },
  { unique: true }
);

const StreamReport =
  mongoose.models.StreamReport ||
  mongoose.model("StreamReport", StreamReportSchema);

/* ======================
   API Handler
====================== */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    // 🔐 Decode user
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      stream,
      testId,
      aptitudeScore,
      behaviorScore,
      mentalScore,
      totalScore
    } = req.body;

    // 🔁 Overwrite (retake allowed)
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

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}