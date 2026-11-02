import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as dashboardService from "../services/dashboard.service";

export const admin = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await dashboardService.getAdminDashboard();
  return success(res, data, "Admin dashboard");
});

export const staff = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await dashboardService.getStaffDashboard();
  return success(res, data, "Staff dashboard");
});
