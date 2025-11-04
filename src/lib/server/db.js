import mongoose from 'mongoose';
import { DB_CONNECTION_STRING } from '$env/static/private';

export async function connectToDatabase() {

	if (mongoose.connection.readyState === 0) {
    mongoose.connect(DB_CONNECTION_STRING)
      .then(() => {
        console.log("✅ Connected to MongoDB");
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
      });
  }
  
}