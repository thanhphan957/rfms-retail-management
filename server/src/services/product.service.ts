import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Review } from "../models/Review";
import { Reply } from "../models/Reply";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";
import { escapeRegex, stripDangerousHtml } from "../utils/sanitize";
import { paginated, parsePagination } from "../utils/pagination";

export async function listProducts(query: Record<string, unknown>, activeOnly: boolean) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (activeOnly) filter.isActive = true;
  if (query.category) filter.category = query.category;
  const searchTerm = String(query.q || query.search || "").trim();
  if (searchTerm) {
    const q = escapeRegex(searchTerm);
    filter.$or = [{ name: new RegExp(q, "i") }, { sku: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
  }

  const sortKey = String(query.sort || "createdAt");
  const order = String(query.order || "desc") === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> =
    sortKey === "price"
      ? { price: order, _id: -1 }
      : sortKey === "name"
      ? { name: order, _id: -1 }
      : { createdAt: order, _id: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).populate("category").sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const ids = items.map((p) => p._id);
  const stats = await Review.aggregate([
    { $match: { product: { $in: ids }, status: "PUBLISHED" } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);
  const statMap = new Map(stats.map((s) => [String(s._id), s]));

  const withStats = items.map((p) => {
    const s = statMap.get(p.id);
    const obj = p.toObject();
    return {
      ...obj,
      averageRating: s ? Number(s.avgRating.toFixed(2)) : 0,
      totalReviews: s?.totalReviews || 0,
    };
  });

  if (sortKey === "rating") {
    withStats.sort((a, b) => (order === 1 ? a.averageRating - b.averageRating : b.averageRating - a.averageRating));
  }

  return paginated(withStats, total, page, limit);
}

export async function getProductDetail(id: string, includeHidden = false) {
  const product = await Product.findById(id).populate("category");
  if (!product) throw new ApiError(404, "Product not found");
  if (!includeHidden && !product.isActive) throw new ApiError(404, "Product not found");

  const reviewFilter: Record<string, unknown> = { product: product._id };
  if (!includeHidden) reviewFilter.status = "PUBLISHED";

  const reviews = await Review.find(reviewFilter)
    .populate("customer", "name email avatar")
    .sort({ createdAt: -1 });

  const reviewIds = reviews.map((r) => r._id);
  const replies = await Reply.find({ review: { $in: reviewIds } }).populate("staff", "name role");
  const replyMap = new Map(replies.map((r) => [String(r.review), r]));

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  const reviewPayload = reviews.map((r) => {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += r.rating;
    return { ...r.toObject(), reply: replyMap.get(r.id) || null };
  });

  const totalReviews = reviews.length;
  return {
    ...product.toObject(),
    averageRating: totalReviews ? Number((sum / totalReviews).toFixed(2)) : 0,
    totalReviews,
    ratingDistribution: distribution,
    reviews: reviewPayload,
    reviewUrl: `${env.clientOrigin}/review/${product.id}`,
  };
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  sku: string;
  stock: number;
  isActive?: boolean;
}) {
  const category = await Category.findById(input.category);
  if (!category) throw new ApiError(400, "Category not found");
  return Product.create({
    name: stripDangerousHtml(input.name),
    description: stripDangerousHtml(input.description || ""),
    price: input.price,
    image: input.image || "",
    category: input.category,
    sku: input.sku.toUpperCase(),
    stock: input.stock,
    isActive: input.isActive ?? true,
  });
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  if (input.category) {
    const category = await Category.findById(String(input.category));
    if (!category) throw new ApiError(400, "Category not found");
    product.category = new mongoose.Types.ObjectId(String(input.category));
  }
  if (typeof input.name === "string") product.name = stripDangerousHtml(input.name);
  if (typeof input.description === "string") product.description = stripDangerousHtml(input.description);
  if (typeof input.price === "number") product.price = input.price;
  if (typeof input.image === "string") product.image = input.image;
  if (typeof input.sku === "string") product.sku = input.sku.toUpperCase();
  if (typeof input.stock === "number") product.stock = input.stock;
  if (typeof input.isActive === "boolean") product.isActive = input.isActive;
  await product.save();
  return product.populate("category");
}

export async function deleteProduct(id: string) {
  const reviewCount = await Review.countDocuments({ product: id });
  if (reviewCount > 0) {
    throw new ApiError(400, "Cannot delete a product that already has reviews. Deactivate it instead.");
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
}

export function getProductQrPayload(id: string) {
  return { url: `${env.clientOrigin}/review/${id}` };
}
