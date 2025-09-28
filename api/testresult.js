import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, maxStream } = req.body;

    if (!id || !maxStream) {
      return res
        .status(400)
        .json({ success: false, message: "id and maxStream required" });
    }

   
    await client.connect();
    const db = client.db("myDatabase"); 
    const users = db.collection("users");


    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { selectedStream: maxStream } },
      { returnDocument: "after" } 
    );

    if (!result.value) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Stream saved successfully",
      profile: {
        id: result.value._id,
        firstName: result.value.firstName,
        lastName: result.value.lastName,
        email: result.value.email,
        mobileNumber: result.value.mobileno,
        selectedStream: result.value.selectedStream,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    
  }
}
