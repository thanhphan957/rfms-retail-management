import { Product } from "../models/Product";
import { User } from "../models/User";
import { Review } from "../models/Review";
import { Reply } from "../models/Reply";

export async function getAdminDashboard() {
  const [totalProducts, totalCustomers, totalReviews, avgAgg, recentReviews] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: "CUSTOMER" }),
    Review.countDocuments(),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Review.find()
      .populate("customer", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  const repliedIds = await Reply.distinct("review");
  const unrepliedCount = await Review.countDocuments({ _id: { $nin: repliedIds } });

  const ratingDistributionRaw = await Review.aggregate([
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistributionRaw.forEach((row) => {
    ratingDistribution[row._id as 1 | 2 | 3 | 4 | 5] = row.count;
  });

  const since = new Date();
  since.setDate(since.getDate() - 29);
  const ratingOverTime = await Review.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topRatedProducts = await Review.aggregate([
    { $match: { status: "PUBLISHED" } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    { $match: { totalReviews: { $gte: 1 } } },
    { $sort: { averageRating: -1, totalReviews: -1 } },
    { $limit: 5 },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $project: { name: "$product.name", sku: "$product.sku", averageRating: 1, totalReviews: 1 } },
  ]);

  const mostReviewedProducts = await Review.aggregate([
    { $group: { _id: "$product", totalReviews: { $sum: 1 }, averageRating: { $avg: "$rating" } } },
    { $sort: { totalReviews: -1 } },
    { $limit: 5 },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $project: { name: "$product.name", sku: "$product.sku", totalReviews: 1, averageRating: 1 } },
  ]);

  const pendingQueue = await Review.find({ _id: { $nin: repliedIds } })
    .populate("customer", "name")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalProducts,
    totalCustomers,
    totalReviews,
    averageRating: avgAgg[0]?.avg ? Number(avgAgg[0].avg.toFixed(2)) : 0,
    unrepliedCount,
    recentReviews,
    ratingDistribution,
    ratingOverTime: ratingOverTime.map((r) => ({
      date: r._id,
      averageRating: Number(r.averageRating.toFixed(2)),
      count: r.count,
    })),
    topRatedProducts,
    mostReviewedProducts,
    pendingQueue,
  };
}

export async function getStaffDashboard() {
  const repliedIds = await Reply.distinct("review");
  const [totalReviews, unrepliedCount, avgAgg, ratingDistributionRaw, pendingQueue] = await Promise.all([
    Review.countDocuments(),
    Review.countDocuments({ _id: { $nin: repliedIds } }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Review.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
    Review.find({ _id: { $nin: repliedIds } })
      .populate("customer", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(15),
  ]);
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistributionRaw.forEach((row) => {
    ratingDistribution[row._id as 1 | 2 | 3 | 4 | 5] = row.count;
  });
  return {
    totalReviews,
    unrepliedCount,
    averageRating: avgAgg[0]?.avg ? Number(avgAgg[0].avg.toFixed(2)) : 0,
    ratingDistribution,
    pendingQueue,
  };
}
