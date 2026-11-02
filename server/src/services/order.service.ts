import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { paginated, parsePagination } from "../utils/pagination";

export async function createOrder(
  customerId: string,
  items: { productId: string; quantity: number }[]
) {
  if (!items || items.length === 0) throw new ApiError(400, "Giỏ hàng trống");

  let totalAmount = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, `Sản phẩm không tồn tại: ${item.productId}`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock})`);
    }
    resolvedItems.push({ product: product._id, quantity: item.quantity, price: product.price });
    totalAmount += product.price * item.quantity;
    
    // Trừ tồn kho
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    customer: customerId,
    items: resolvedItems,
    totalAmount,
    status: "CONFIRMED",
  });

  return order.populate({ path: "items.product", select: "name sku image price" });
}

export async function listMyOrders(customerId: string, query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { customer: customerId };
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: "items.product", select: "name sku image price" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

export async function cancelOrder(orderId: string, customerId: string) {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng");
  }
  if (order.status === "CANCELLED") {
    throw new ApiError(400, "Đơn hàng này đã bị hủy trước đó");
  }

  // Hoàn lại tồn kho cho các sản phẩm trong đơn
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = "CANCELLED";
  await order.save();
  return order.populate({ path: "items.product", select: "name sku image price" });
}

export async function hasPurchasedProduct(customerId: string, productId: string): Promise<boolean> {
  const order = await Order.findOne({
    customer: customerId,
    status: { $ne: "CANCELLED" },
    "items.product": productId,
  });
  return !!order;
}
