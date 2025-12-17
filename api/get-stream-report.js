import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/* ======================
   MongoDB Connection
====================== */
if (!mongoose.connection.readyState) {
  await mongoose.connect(process.env.MONGODB_URI);
}

const StreamReport =
  mongoose.models.StreamReport ||
  mongoose.model("StreamReport");

/* ======================
   API Handler
====================== */
export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}