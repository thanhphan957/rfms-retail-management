import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import * as orderService from "../services/order.service";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await orderService.createOrder(req.user!.id, req.body.items);
  return success(res, data, "Đặt hàng thành công", 201);
});

export const listMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await orderService.listMyOrders(req.user!.id, req.query as Record<string, unknown>);
  return success(res, data, "My orders");
});

export const cancel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = await orderService.cancelOrder(id, req.user!.id);
  return success(res, data, "Đã hủy đơn hàng thành công");
});

export const checkPurchased = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const purchased = await orderService.hasPurchasedProduct(req.user!.id, productId);
  return success(res, { purchased }, "Check purchased");
});
