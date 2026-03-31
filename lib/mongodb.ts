import mongoose from "mongoose";

declare global {
  var _mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global._mongooseConnection ?? { conn: null, promise: null };
global._mongooseConnection = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Please add it to .env.local.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error: unknown) => {
        cached.promise = null;
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to connect to MongoDB Atlas: ${message}`);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
