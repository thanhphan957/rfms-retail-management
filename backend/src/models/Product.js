import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: "sản phẩm", trim: true },
    description: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
