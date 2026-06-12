import { MongoClient } from "mongodb";

let client;

export async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return {
    client,
    db: client.db(process.env.DB_NAME || "myDatabase"),        // users, sessions, bookings
    adminDb: client.db(process.env.ADMIN_DB_NAME || "alphascramblers"), // admins collection
  };
}