import { getMongoClient } from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB || "bio");
    const collection = db.collection("stats");

    const document = await collection.findOneAndUpdate(
      { id: "site-stats" },
      {
        $inc: { views: 1 },
        $set: { updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );

    const views = document?.views ?? 0;

    return NextResponse.json({ views });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        views: 0,
        error: "Unable to load views counter.",
      },
      { status: 500 }
    );
  }
}
