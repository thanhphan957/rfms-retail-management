import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";
import { Order, Paginated } from "../../types";
import { money, dateTime } from "../../utils/format";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../contexts/ToastContext";
import { Package } from "lucide-react";

const statusLabel: Record<string, string> = {
  CONFIRMED: "Đã xác nhận",
  PENDING: "Chờ xử lý",
  CANCELLED: "Đã hủy",
};
const statusColor: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export function MyOrdersPage() {
  const [data, setData] = useState<Paginated<Order> | null>(null);
  const toast = useToast();

  useEffect(() => {
    api.get("/orders/me")
      .then((r) => setData(r.data.data))
      .catch((e) => toast.push(getErrorMessage(e), "error"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2"><Package size={22} /> Đơn hàng của tôi</h1>
      {!data?.items.length && <div className="mt-6"><EmptyState title="Bạn chưa có đơn hàng nào" hint="Hãy mua sắm để tạo đơn hàng đầu tiên" /></div>}
      <div className="mt-6 space-y-4">
        {data?.items.map((order) => (
          <div key={order._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                <span className={`ml-3 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <span className="text-xs text-slate-400">{dateTime(order.createdAt)}</span>
            </div>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded object-cover bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product._id}`} className="text-sm font-medium hover:text-brand-700 line-clamp-1">{item.product.name}</Link>
                    <p className="text-xs text-slate-400">x{item.quantity} × {money(item.price)}</p>
                  </div>
                  <div className="text-sm font-semibold">{money(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t pt-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Tổng đơn hàng</span>
              <span className="font-bold text-brand-700">{money(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
