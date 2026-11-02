import { Review } from "../models/Review";
import { Reply } from "../models/Reply";

function buildMatch(query: Record<string, unknown>) {
  const match: Record<string, unknown> = {};
  if (query.productId) match.product = query.productId;
  if (query.rating) match.rating = Number(query.rating);
  if (query.from || query.to) {
    const createdAt: Record<string, Date> = {};
    if (query.from) createdAt.$gte = new Date(String(query.from));
    if (query.to) createdAt.$lte = new Date(String(query.to));
    match.createdAt = createdAt;
  }
  return match;
}

export async function getReport(query: Record<string, unknown>) {
  const match = buildMatch(query);
  const reviews = await Review.find(match).populate("product", "name sku").populate("customer", "name email");
  const repliedIds = new Set((await Reply.distinct("review")).map(String));
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let unrepliedCount = 0;
  reviews.forEach((r) => {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += r.rating;
    if (!repliedIds.has(r.id)) unrepliedCount += 1;
  });
  return {
    totalReviews: reviews.length,
    averageRating: reviews.length ? Number((sum / reviews.length).toFixed(2)) : 0,
    ratingDistribution: distribution,
    unrepliedCount,
    reviews,
  };
}

export function toCsv(report: Awaited<ReturnType<typeof getReport>>): string {
  const header = ["Review ID", "Product", "SKU", "Customer", "Email", "Rating", "Comment", "Status", "Created At"];
  const rows = report.reviews.map((r) => {
    const product = r.product as unknown as { name?: string; sku?: string };
    const customer = r.customer as unknown as { name?: string; email?: string };
    return [
      r.id,
      csv(product?.name),
      csv(product?.sku),
      csv(customer?.name),
      csv(customer?.email),
      r.rating,
      csv(r.comment),
      r.status,
      r.createdAt.toISOString(),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function csv(value?: string) {
  const v = (value || "").replace(/"/g, '""');
  return `"${v}"`;
}
