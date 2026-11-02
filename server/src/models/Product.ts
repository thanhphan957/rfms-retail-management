import mongoose, { Document, Schema, Types } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: Types.ObjectId;
  sku: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", sku: "text" });
productSchema.index({ category: 1, isActive: 1 });

export const Product = mongoose.model<ProductDocument>("Product", productSchema);
