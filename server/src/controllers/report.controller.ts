import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as reportService from "../services/report.service";

export const get = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportService.getReport(req.query as Record<string, unknown>);
  return success(res, data, "Report");
});

export const exportCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await reportService.getReport(req.query as Record<string, unknown>);
  const csv = reportService.toCsv(report);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=rfms-report.csv");
  res.send(csv);
});
