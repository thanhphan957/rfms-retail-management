import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as reviewService from "../services/review.service";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reviewService.listReviews(req.query as Record<string, unknown>);
  return success(res, data, "Reviews");
});

export const listMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reviewService.listMyReviews(req.user!.id, req.query as Record<string, unknown>);
  return success(res, data, "My reviews");
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reviewService.getReviewById(req.params.id, req.user!);
  return success(res, data, "Review");
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reviewService.createReview(req.user!.id, req.body);
  return success(res, data, "Review submitted", 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reviewService.updateReview(req.params.id, req.user!, req.body);
  return success(res, data, "Review updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await reviewService.deleteReview(req.params.id, req.user!);
  return success(res, null, "Review deleted");
});
