import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as replyService from "../services/reply.service";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await replyService.createReply(req.user!, req.body);
  return success(res, data, "Reply created", 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await replyService.updateReply(req.params.id, req.user!, req.body.content);
  return success(res, data, "Reply updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await replyService.deleteReply(req.params.id, req.user!);
  return success(res, null, "Reply deleted");
});
