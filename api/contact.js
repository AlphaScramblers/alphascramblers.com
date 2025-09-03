import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      if (!client) {
        client = new MongoClient(uri);
        await client.connect();
      }

      const db = client.db("myDatabase"); // use your db name
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
