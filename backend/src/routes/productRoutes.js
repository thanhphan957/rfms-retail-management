import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate("category", "name").sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, sku, category, price, stock, unit, description } = req.body;
    if (!name || !sku) return res.status(400).json({ message: "Tên và SKU là bắt buộc." });
    const product = await Product.create({
      name, sku, category: category || null,
      price: Number(price) || 0, stock: Number(stock) || 0,
      unit: unit || "sản phẩm", description: description || ""
    });
    res.status(201).json(await product.populate("category", "name"));
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "SKU đã tồn tại." });
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = { ...req.body };
    if ("price" in data) data.price = Number(data.price);
    if ("stock" in data) data.stock = Number(data.stock);
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json(product);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json({ message: "Đã xóa sản phẩm." });
  } catch (e) { next(e); }
});

export default router;
