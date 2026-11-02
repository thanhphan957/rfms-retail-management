import { Router } from "express";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [productCount, customerCount, orderCount, revenueAgg, lowStock] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments({ status: "completed" }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(8)
    ]);

    res.json({
      productCount,
      customerCount,
      orderCount,
      revenue: revenueAgg[0]?.total || 0,
      lowStock
    });
  } catch (e) { next(e); }
});

export default router;
