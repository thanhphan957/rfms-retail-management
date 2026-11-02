import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Product, Review } from "../../types";
import { money, dateTime, initials } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { PageSkeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8"><PageSkeleton /></div>;
  if (error || !product) return <div className="mx-auto max-w-6xl px-4 py-8"><ErrorState message={error || "Không tìm thấy"} onRetry={load} /></div>;

  const cat = typeof product.category === "object" ? product.category.name : "";
  const dist = product.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.push(`Đã thêm ${qty} "${product.name}" vào giỏ hàng`, "success");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={product.image} alt={product.name} className="card h-80 w-full object-cover" />
        <div>
          <p className="text-sm text-slate-500">{cat} · {product.sku}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <StarRating value={Math.round(product.averageRating || 0)} readOnly />
            <span className="text-sm text-slate-600">{product.averageRating} ({product.totalReviews} đánh giá)</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-brand-700">{money(product.price)}</p>
          <p className="mt-3 text-slate-600">{product.description}</p>
          <p className="mt-2 text-sm">Tồn kho: <b>{product.stock}</b></p>

          {product.stock > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-1">
                <button
                  className="btn-secondary p-1"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  className="btn-secondary p-1"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} /> Thêm vào giỏ hàng
              </button>
            </div>
          )}

          <Link to={`/review/${product._id}`} className="btn-primary mt-4 inline-flex">Gửi đánh giá</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="card p-5 md:col-span-2">
          <h2 className="font-semibold">Phân bố sao</h2>
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = dist[s as 1 | 2 | 3 | 4 | 5];
              const pct = product.totalReviews ? (n / product.totalReviews) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-10">{s} sao</span>
                  <div className="h-2 flex-1 rounded bg-slate-100">
                    <div className="h-2 rounded bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center p-5">
          <h2 className="mb-2 font-semibold text-slate-800">Quét mã QR để đánh giá</h2>
          <p className="mb-4 text-xs text-slate-500 text-center">
            Dùng điện thoại quét mã để mở nhanh trang đánh giá sản phẩm này
          </p>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <QRCodeSVG
              value={product.reviewUrl || `${window.location.origin}/review/${product._id}`}
              size={150}
              level="M"
            />
          </div>
          <Link
            to={`/review/${product._id}`}
            className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            Hoặc bấm vào đây để đánh giá
          </Link>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Đánh giá</h2>
      <div className="mt-4 space-y-3">
        {(product.reviews || []).map((r: Review) => {
          const customer = typeof r.customer === "object" ? r.customer : null;
          return (
            <div key={r._id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {initials(customer?.name || "KH")}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{customer?.name}</b>
                    <StarRating value={r.rating} readOnly size={14} />
                    <span className="text-xs text-slate-400">{dateTime(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{r.comment}</p>
                  {r.reply && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                      <b>Phản hồi từ cửa hàng</b>
                      <p className="mt-1 text-slate-600">{r.reply.content}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {(product.reviews || []).length === 0 && <p className="text-sm text-slate-500">Chưa có đánh giá.</p>}
      </div>
    </div>
  );
}
