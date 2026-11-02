import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as userService from "../services/user.service";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await userService.listUsers(req.query as Record<string, unknown>);
  return success(res, data, "Users");
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await userService.getUser(req.params.id);
  return success(res, data, "User");
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await userService.createUser(req.body);
  return success(res, data, "User created", 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await userService.updateUser(req.params.id, req.body, req.user!.id);
  return success(res, data, "User updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!.id);
  return success(res, null, "User deleted");
});
