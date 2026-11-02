import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as categoryService from "../services/category.service";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activeOnly = req.user?.role !== "ADMIN";
  const data = await categoryService.listCategories(activeOnly);
  return success(res, data, "Categories");
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await categoryService.getCategory(req.params.id);
  return success(res, data, "Category");
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await categoryService.createCategory(req.body);
  return success(res, data, "Category created", 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  return success(res, data, "Category updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  return success(res, null, "Category deleted");
});
