import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as productService from "../services/product.service";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activeOnly = req.user?.role !== "ADMIN";
  const data = await productService.listProducts(req.query as Record<string, unknown>, activeOnly);
  return success(res, data, "Products");
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const includeHidden = req.user?.role === "ADMIN";
  const data = await productService.getProductDetail(req.params.id, includeHidden);
  return success(res, data, "Product");
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await productService.createProduct(req.body);
  return success(res, data, "Product created", 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  return success(res, data, "Product updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.id);
  return success(res, null, "Product deleted");
});

export const qr = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = productService.getProductQrPayload(req.params.id);
  return success(res, data, "QR payload");
});
