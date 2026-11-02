import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";
import { Order, Paginated } from "../../types";
import { money, dateTime } from "../../utils/format";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../contexts/ToastContext";
import { Package, XCircle } from "lucide-react";

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
  const [cancelId, setCancelId] = useState<string | null>(null);
  const toast = useToast();

  const load = () => {
    api.get("/orders/me")
      .then((r) => setData(r.data.data))
      .catch((e) => toast.push(getErrorMessage(e), "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelId) return;
    try {
      await api.patch(`/orders/${cancelId}/cancel`);
      toast.push("Đã hủy đơn hàng thành công", "success");
      setCancelId(null);
      load();
    } catch (e) {
      toast.push(getErrorMessage(e, "Không thể hủy đơn hàng"), "error");
    }
  };

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
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{dateTime(order.createdAt)}</span>
                {order.status !== "CANCELLED" && (
                  <button
                    onClick={() => setCancelId(order._id)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition"
                  >
                    <XCircle size={14} /> Hủy đơn
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={item.product?.image || ""} alt={item.product?.name || "Product"} className="h-12 w-12 rounded object-cover bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?._id}`} className="text-sm font-medium hover:text-brand-700 line-clamp-1">{item.product?.name}</Link>
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

      <ConfirmDialog
        open={!!cancelId}
        title="Hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Số lượng sản phẩm sẽ được hoàn lại vào kho hàng."
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
}
