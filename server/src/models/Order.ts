import mongoose, { Document, Schema, Types } from "mongoose";

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderItemDoc {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface OrderDocument extends Document {
  customer: Types.ObjectId;
  items: OrderItemDoc[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
