import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Category, Paginated, Product } from "../../types";
import { money } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { Pagination } from "../../components/Pagination";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";

export function ProductListPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api
      .get("/products", { params: { q, category: category || undefined, sort, page, limit: 8 } })
      .then((r) => {
        setData(r.data.data);
        setError("");
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data.data));
  }, []);

  useEffect(() => {
    load();
  }, [q, category, sort, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Sản phẩm</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Tìm tên, SKU..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select className="input" value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          <option value="">Tất cả danh mục</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Mới nhất</option>
          <option value="price">Giá</option>
          <option value="name">Tên</option>
          <option value="rating">Đánh giá</option>
        </select>
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      )}
      {error && !loading && <div className="mt-6"><ErrorState message={error} onRetry={load} /></div>}
      {!loading && !error && data && data.items.length === 0 && (
        <div className="mt-6"><EmptyState title="Không có sản phẩm" hint="Thử đổi bộ lọc hoặc từ khóa." /></div>
      )}
      {!loading && data && data.items.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((p) => (
              <div key={p._id} className="card overflow-hidden hover:shadow-md transition relative">
                <Link to={`/products/${p._id}`}>
                  <img src={p.image} alt={p.name} className="h-40 w-full object-cover bg-slate-100" />
                  <div className="p-4">
                    <div className="text-xs text-slate-500">{p.sku}</div>
                    <h3 className="mt-1 font-semibold line-clamp-2">{p.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <StarRating value={Math.round(p.averageRating || 0)} readOnly size={14} />
                      <span className="text-slate-500">({p.totalReviews || 0})</span>
                    </div>
                    <div className="mt-2 font-bold text-brand-700">{money(p.price)}</div>
                  </div>
                </Link>
                {p.stock > 0 && (
                  <button
                    className="absolute bottom-3 right-3 rounded-full bg-brand-700 p-2 text-white shadow hover:bg-brand-800 transition"
                    title="Thêm vào giỏ hàng"
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(p, 1);
                      toast.push(`Đã thêm "${p.name}" vào giỏ`, "success");
                    }}
                  >
                    <ShoppingCart size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination meta={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
