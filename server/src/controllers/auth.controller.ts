import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as authService from "../services/auth.service";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await authService.register(req.body, res);
  return success(res, data, "Registered successfully", 201);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await authService.login(req.body, res);
  return success(res, data, "Logged in successfully");
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logout(req, res);
  return success(res, null, "Logged out successfully");
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await authService.refresh(req, res);
  return success(res, data, "Token refreshed");
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");
  return success(res, user, "Current user");
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  return success(res, null, "Password changed. Please log in again.");
});
