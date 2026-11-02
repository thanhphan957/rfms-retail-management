import { Router } from "express";
import Customer from "../models/Customer.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try { res.json(await Customer.find().sort({ createdAt: -1 })); } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (e) { next(e); }
});

export default router;
