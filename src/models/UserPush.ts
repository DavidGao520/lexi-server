import mongoose from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";

const userPushSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pushInfo: { type: mongoose.Schema.Types.Mixed, required: true }
});

export const UserPush = mongoDbProvider.getModel("UserPush", userPushSchema);