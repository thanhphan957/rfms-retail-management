import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb(uri = env.mongodbUri): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  return mongoose;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
