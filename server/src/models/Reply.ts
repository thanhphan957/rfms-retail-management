import mongoose, { Document, Schema, Types } from "mongoose";

export interface ReplyDocument extends Document {
  review: Types.ObjectId;
  staff: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<ReplyDocument>(
  {
    review: { type: Schema.Types.ObjectId, ref: "Review", required: true, unique: true },
    staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true },
);

export const Reply = mongoose.model<ReplyDocument>("Reply", replySchema);
