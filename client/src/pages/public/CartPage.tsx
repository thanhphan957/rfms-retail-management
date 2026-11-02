import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { money } from "../../utils/format";
import api, { getErrorMessage } from "../../services/api";
import { EmptyState } from "../../components/EmptyState";
import { useState } from "react";

export function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const checkout = async () => {
    if (!user) { navigate("/login"); return; }
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
      });
      clearCart();
      toast.push("Đặt hàng thành công!", "success");
      navigate("/customer/orders");
    } catch (e) {
      toast.push(getErrorMessage(e, "Không thể đặt hàng"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Giỏ hàng trống"
          hint="Hãy chọn sản phẩm để thêm vào giỏ hàng"
        />
        <div className="mt-4 text-center">
          <Link to="/products" className="btn-primary inline-flex">Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag size={24} /> Giỏ hàng</h1>
      <div className="mt-6 space-y-3">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="card flex items-center gap-4 p-4">
            <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Link to={`/products/${product._id}`} className="font-semibold hover:text-brand-700 line-clamp-2">{product.name}</Link>
              <p className="mt-1 text-brand-700 font-bold">{money(product.price)}</p>
              <p className="text-xs text-slate-400">Tồn kho: {product.stock}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary p-1" onClick={() => updateQty(product._id, quantity - 1)}><Minus size={14} /></button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button className="btn-secondary p-1" onClick={() => updateQty(product._id, Math.min(quantity + 1, product.stock))}><Plus size={14} /></button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-semibold">{money(product.price * quantity)}</p>
            </div>
            <button className="text-red-500 hover:text-red-700 p-1" onClick={() => removeItem(product._id)}><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <div className="mt-6 card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-slate-500">Tổng cộng:</span>
          <span className="ml-2 text-2xl font-bold text-brand-700">{money(total)}</span>
        </div>
        <button className="btn-primary px-8" onClick={checkout} disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </div>
  );
}
