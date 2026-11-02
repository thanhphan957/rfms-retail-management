import mongoose, { Document, Schema, Types } from "mongoose";
import { ReviewStatus, Sentiment } from "../types";

export interface ReviewDocument extends Document {
  product: Types.ObjectId;
  customer: Types.ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  sentiment?: Sentiment | null;
  sentimentAnalyzedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 2000 },
    status: { type: String, enum: ["PUBLISHED", "HIDDEN"], default: "PUBLISHED" },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"], default: null },
    sentimentAnalyzedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, customer: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });

export const Review = mongoose.model<ReviewDocument>("Review", reviewSchema);
