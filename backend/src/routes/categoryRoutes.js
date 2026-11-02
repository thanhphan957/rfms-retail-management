import { Router } from "express";
import Category from "../models/Category.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try { res.json(await Category.find().sort({ name: 1 })); } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description || ""
    });
    res.status(201).json(category);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "Danh mục đã tồn tại." });
    next(e);
  }
});

export default router;
