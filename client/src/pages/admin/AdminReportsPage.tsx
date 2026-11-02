import { useEffect, useState } from "react";
import { Download, Filter, Star, MessageSquare, AlertCircle } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Product, ReportData } from "../../types";
import { dateTime } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { PageSkeleton } from "../../components/Skeleton";
import { useToast } from "../../contexts/ToastContext";

export function AdminReportsPage() {
  const toast = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("");

  const loadProducts = () => {
    api
      .get("/products", { params: { limit: 100 } })
      .then((res) => setProducts(res.data.data?.items || []))
      .catch(() => {});
  };

  const loadReport = () => {
    setLoading(true);
    api
      .get("/reports", {
        params: {
          from: from || undefined,
          to: to || undefined,
          productId: productId || undefined,
          rating: rating || undefined,
        },
      })
      .then((res) => setReport(res.data.data))
      .catch((err) => toast.push(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadReport();
  }, [from, to, productId, rating]);

  const handleExportCsv = async () => {
    try {
      const response = await api.get("/reports/export", {
        params: {
          from: from || undefined,
          to: to || undefined,
          productId: productId || undefined,
          rating: rating || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rfms-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.push("Đã xuất báo cáo CSV thành công", "success");
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể xuất file CSV"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo & Phân tích đánh giá</h1>
          <p className="text-sm text-slate-500">
            Xem báo cáo tổng hợp phản hồi, lọc chi tiết và xuất dữ liệu định dạng CSV.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Download size={16} /> Xuất báo cáo CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
          <Filter size={16} className="text-slate-400" />
          <span>Bộ lọc báo cáo</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Từ ngày</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Đến ngày</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Sản phẩm</label>
            <select
              className="input"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Tất cả sản phẩm</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Số sao đánh giá</label>
            <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">Tất cả mức sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : !report ? null : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Tổng lượt đánh giá
                </span>
                <MessageSquare size={18} className="text-indigo-500" />
              </div>
              <div className="mt-3 text-3xl font-bold text-slate-800">{report.totalReviews}</div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Rating trung bình
                </span>
                <Star size={18} className="text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{report.averageRating}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-1">
                <StarRating value={Math.round(report.averageRating)} readOnly size={14} />
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Chưa có phản hồi
                </span>
                <AlertCircle size={18} className="text-rose-500" />
              </div>
              <div className="mt-3 text-3xl font-bold text-rose-600">{report.unrepliedCount}</div>
            </div>
          </div>

          {/* Star Distribution Progress */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800">Chi tiết phân bố từng mức sao</h2>
            <div className="mt-4 space-y-3">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = report.ratingDistribution[s as 1 | 2 | 3 | 4 | 5] || 0;
                const pct = report.totalReviews ? Math.round((count / report.totalReviews) * 100) : 0;
                return (
                  <div key={s} className="flex items-center gap-4 text-sm">
                    <span className="w-14 font-medium text-slate-700">{s} sao</span>
                    <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-medium text-slate-800">
                      {count} <span className="text-xs text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews list in report */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                Dữ liệu đánh giá khớp bộ lọc ({report.reviews.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Bình luận</th>
                    <th className="px-6 py-3">Ngày gửi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.reviews.map((r) => {
                    const product = typeof r.product === "object" ? r.product : null;
                    const customer = typeof r.customer === "object" ? r.customer : null;
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 font-medium text-slate-800">
                          {product?.name || "N/A"}
                        </td>
                        <td className="px-6 py-3">{customer?.name || "N/A"}</td>
                        <td className="px-6 py-3">
                          <StarRating value={r.rating} readOnly size={12} />
                        </td>
                        <td className="px-6 py-3 text-slate-600 max-w-xs truncate">
                          {r.comment || "—"}
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-400">
                          {dateTime(r.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                  {report.reviews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Không có đánh giá nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
