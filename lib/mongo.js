// /lib/mongo.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI is missing in Vercel environment variables");
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      return {
        client,
        db: client.db("myDatabase")
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}