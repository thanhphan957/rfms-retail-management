import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api, { getErrorMessage } from "../../services/api";
import { Category, Paginated, Product } from "../../types";
import { money } from "../../utils/format";
import { Pagination } from "../../components/Pagination";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { PageSkeleton } from "../../components/Skeleton";
import { useToast } from "../../contexts/ToastContext";

export function AdminProductsPage() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const loadCategories = () => {
    api.get("/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  };

  const loadProducts = () => {
    setLoading(true);
    api.get("/products", {
      params: {
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: category || undefined,
      },
    })
      .then((res) => setData(res.data.data))
      .catch((err) => toast.push(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.push("Đã xóa sản phẩm thành công", "success");
      setDeleteId(null);
      loadProducts();
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể xóa sản phẩm"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-500">
            Danh sách tất cả sản phẩm, trạng thái tồn kho và mã QR đánh giá.
          </p>
        </div>
        <Link
          to="/admin/products/create"
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus size={16} /> Thêm sản phẩm
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, SKU..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              className="input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-secondary">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <PageSkeleton />
      ) : !data?.items.length ? (
        <EmptyState
          title="Không tìm thấy sản phẩm nào"
          hint="Thử tìm kiếm với từ khóa khác hoặc tạo thêm sản phẩm mới."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá bán</th>
                  <th className="px-6 py-4">Tồn kho</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((p) => {
                  const catName = typeof p.category === "object" ? p.category.name : "N/A";
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || "https://placehold.co/80"}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                          />
                          <div>
                            <Link
                              to={`/products/${p._id}`}
                              className="font-medium text-slate-800 hover:text-brand-600 inline-flex items-center gap-1"
                            >
                              {p.name} <ExternalLink size={12} className="text-slate-400" />
                            </Link>
                            <div className="text-xs text-slate-400">
                              ⭐ {p.averageRating || 0} ({p.totalReviews || 0} đánh giá)
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{p.sku}</td>
                      <td className="px-6 py-4">{catName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{money(p.price)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${
                            p.stock > 10
                              ? "bg-emerald-50 text-emerald-700"
                              : p.stock > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {p.isActive ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setQrProduct(p)}
                            title="Xem mã QR"
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                          >
                            <QrCode size={16} />
                          </button>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            title="Chỉnh sửa"
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(p._id)}
                            title="Xóa"
                            className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <Pagination
              meta={data.pagination}
              onPage={(p: number) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Xác nhận xóa sản phẩm"
        message="Hành động này sẽ xóa sản phẩm và tất cả dữ liệu đánh giá liên quan. Bạn có chắc chắn không?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />

      {/* QR Code Modal */}
      {qrProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setQrProduct(null)} />
          <div className="relative card max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Mã QR Đánh Giá</h3>
            <p className="text-xs text-slate-500">{qrProduct.name}</p>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <QRCodeSVG
                value={`${window.location.origin}/review/${qrProduct._id}`}
                size={200}
                level="M"
              />
            </div>
            <p className="text-xs text-slate-400 break-all">
              {`${window.location.origin}/review/${qrProduct._id}`}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <a
                href={`/review/${qrProduct._id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs"
              >
                Mở link
              </a>
              <button onClick={() => setQrProduct(null)} className="btn-primary text-xs">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
