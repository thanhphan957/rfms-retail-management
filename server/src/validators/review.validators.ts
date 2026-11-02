import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
});

export const createReplySchema = z.object({
  reviewId: z.string().regex(/^[a-f\d]{24}$/i),
  content: z.string().min(1).max(2000),
});

export const updateReplySchema = z.object({
  content: z.string().min(1).max(2000),
});
