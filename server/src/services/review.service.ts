import { Review } from "../models/Review";
import { Reply } from "../models/Reply";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { stripDangerousHtml } from "../utils/sanitize";
import { paginated, parsePagination } from "../utils/pagination";
import { sentimentAnalyzer } from "./sentiment/factory";
import { AuthUser } from "../types";
import { hasPurchasedProduct } from "./order.service";

async function attachReplies(reviews: any[]) {
  const ids = reviews.map((r) => r.id || r._id);
  const replies = await Reply.find({ review: { $in: ids } }).populate("staff", "name role");
  const map = new Map(replies.map((r) => [String(r.review), r]));
  return reviews.map((r) => ({ ...(typeof r.toObject === "function" ? r.toObject() : r), reply: map.get(String(r.id || r._id)) || null }));
}

export async function listReviews(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (query.productId) filter.product = query.productId;
  if (query.rating) filter.rating = Number(query.rating);
  if (query.status) filter.status = query.status;
  if (query.customerId) filter.customer = query.customerId;
  if (query.from || query.to) {
    const createdAt: Record<string, Date> = {};
    if (query.from) createdAt.$gte = new Date(String(query.from));
    if (query.to) createdAt.$lte = new Date(String(query.to));
    filter.createdAt = createdAt;
  }

  let reviewQuery = Review.find(filter)
    .populate("customer", "name email avatar")
    .populate("product", "name sku")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const [items, total] = await Promise.all([reviewQuery, Review.countDocuments(filter)]);
  let payload = await attachReplies(items);

  if (query.unreplied === "true") {
    payload = payload.filter((r) => !r.reply);
  }

  return paginated(payload, query.unreplied === "true" ? payload.length : total, page, limit);
}

export async function listMyReviews(customerId: string, query: Record<string, unknown>) {
  return listReviews({ ...query, customerId });
}

export async function getReviewById(id: string, actor: AuthUser) {
  const review = await Review.findById(id)
    .populate("customer", "name email avatar")
    .populate("product", "name sku image");
  if (!review) throw new ApiError(404, "Review not found");
  if (actor.role === "CUSTOMER" && String(review.customer._id || review.customer) !== actor.id) {
    throw new ApiError(403, "You cannot access another customer's review");
  }
  const [withReply] = await attachReplies([review]);
  return withReply;
}

export async function createReview(
  customerId: string,
  input: { productId: string; rating: number; comment?: string },
) {
  const product = await Product.findById(input.productId);
  if (!product || !product.isActive) throw new ApiError(404, "Product not found");

  const existing = await Review.findOne({ product: input.productId, customer: customerId });
  if (existing) {
    throw new ApiError(409, "You already reviewed this product. You can update your existing review.");
  }

  const purchased = await hasPurchasedProduct(customerId, input.productId);
  if (!purchased) {
    throw new ApiError(403, "Bạn cần mua sản phẩm này trước khi có thể đánh giá");
  }

  const comment = stripDangerousHtml(input.comment || "");
  const sentiment = await sentimentAnalyzer.analyze(comment);
  const review = await Review.create({
    product: input.productId,
    customer: customerId,
    rating: input.rating,
    comment,
    status: "PUBLISHED",
    sentiment,
    sentimentAnalyzedAt: sentiment ? new Date() : null,
  });
  return review.populate(["customer", "product"]);
}

export async function updateReview(
  id: string,
  actor: AuthUser,
  input: { rating?: number; comment?: string; status?: "PUBLISHED" | "HIDDEN" },
) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  if (actor.role === "CUSTOMER") {
    if (String(review.customer) !== actor.id) {
      throw new ApiError(403, "You cannot edit another customer's review");
    }
    if (input.status) throw new ApiError(403, "Customers cannot change review status");
    if (input.rating) review.rating = input.rating;
    if (typeof input.comment === "string") {
      review.comment = stripDangerousHtml(input.comment);
      const sentiment = await sentimentAnalyzer.analyze(review.comment);
      review.sentiment = sentiment;
      review.sentimentAnalyzedAt = sentiment ? new Date() : null;
    }
  } else if (actor.role === "ADMIN") {
    if (input.rating) review.rating = input.rating;
    if (typeof input.comment === "string") review.comment = stripDangerousHtml(input.comment);
    if (input.status) review.status = input.status;
  } else {
    throw new ApiError(403, "Staff cannot edit customer reviews");
  }

  await review.save();
  return review;
}

export async function deleteReview(id: string, actor: AuthUser) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");
  if (actor.role === "CUSTOMER" && String(review.customer) !== actor.id) {
    throw new ApiError(403, "You cannot delete another customer's review");
  }
  if (actor.role === "STAFF") {
    throw new ApiError(403, "Staff cannot delete reviews");
  }
  await Reply.deleteOne({ review: review._id });
  await review.deleteOne();
  return review;
}
