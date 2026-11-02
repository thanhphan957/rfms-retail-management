import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Đơn hàng phải có ít nhất một sản phẩm." });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      const quantity = Number(item.quantity);

      if (!product) throw new Error("Sản phẩm không tồn tại.");
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Số lượng không hợp lệ.");
      if (product.stock < quantity) {
        throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho.`);
      }

      const subtotal = product.price * quantity;
      total += subtotal;

      product.stock -= quantity;
      await product.save({ session });

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
        subtotal
      });
    }

    const [order] = await Order.create(
      [{ customer: customer || null, items: orderItems, total }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(await order.populate("customer", "name phone"));
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally {
    session.endSession();
  }
});

export default router;
