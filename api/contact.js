import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

async function connectToDatabase() {
  if (client) {
    return client;
  }
  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri);
  }
  client = await clientPromise;
  return client;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await connectToDatabase();
      const db = client.db("myDatabase"); // Use your database name
      const collection = db.collection("contacts");

      const result = await collection.insertOne(req.body);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}