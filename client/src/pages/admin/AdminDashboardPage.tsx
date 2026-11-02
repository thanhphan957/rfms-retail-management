import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { DashboardAdmin } from "../../types";
import { PageSkeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";
import { StarRating } from "../../components/StarRating";
import { dateTime } from "../../utils/format";

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    api
      .get("/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <PageSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-10">
        <ErrorState message={error || "Không thể tải dữ liệu"} onRetry={loadData} />
      </div>
    );
  }

  const distChartData = [
    { star: "5 sao", count: data.ratingDistribution[5] || 0 },
    { star: "4 sao", count: data.ratingDistribution[4] || 0 },
    { star: "3 sao", count: data.ratingDistribution[3] || 0 },
    { star: "2 sao", count: data.ratingDistribution[2] || 0 },
    { star: "1 sao", count: data.ratingDistribution[1] || 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-sm text-slate-500">
          Số liệu thống kê thời gian thực từ hoạt động bán lẻ và phản hồi khách hàng.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng sản phẩm
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-800">{data.totalProducts}</div>
          <Link
            to="/admin/products"
            className="mt-2 inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Quản lý kho <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Khách hàng
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-800">{data.totalCustomers}</div>
          <Link
            to="/admin/users"
            className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Xem người dùng <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng review
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-800">{data.totalReviews}</div>
          <Link
            to="/admin/reviews"
            className="mt-2 inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Tất cả đánh giá <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rating TB
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-500">
              <Star size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{data.averageRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-1">
            <StarRating value={Math.round(data.averageRating)} readOnly size={14} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chưa trả lời
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-500">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-600">{data.unrepliedCount}</div>
          <Link
            to="/admin/reviews?unreplied=true"
            className="mt-2 inline-flex items-center text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            Cần xử lý ngay <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Rating theo thời gian</h2>
              <p className="text-xs text-slate-400">Biến động điểm số đánh giá 30 ngày qua</p>
            </div>
            <TrendingUp size={18} className="text-slate-400" />
          </div>
          <div className="mt-4 h-64 w-full">
            {data.ratingOverTime && data.ratingOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.ratingOverTime}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="averageRating"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ratingGrad)"
                    name="Rating TB"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có đủ dữ liệu theo ngày
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div>
            <h2 className="font-semibold text-slate-800">Phân bố mức sao (1–5)</h2>
            <p className="text-xs text-slate-400">Tỉ lệ số lượng đánh giá theo cấp bậc sao</p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis dataKey="star" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Rated Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800">Top sản phẩm rating cao nhất</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {data.topRatedProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div className="min-w-0 pr-4">
                  <Link
                    to={`/products/${p._id}`}
                    className="truncate font-medium text-slate-800 hover:text-brand-600 block"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-slate-400">SKU: {p.sku}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{p.averageRating}</span>
                  </div>
                  <span className="text-xs text-slate-400">{p.totalReviews} đánh giá</span>
                </div>
              </div>
            ))}
            {data.topRatedProducts.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Chưa có sản phẩm nào có đánh giá</p>
            )}
          </div>
        </div>

        {/* Most Reviewed Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800">Sản phẩm được đánh giá nhiều nhất</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {data.mostReviewedProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div className="min-w-0 pr-4">
                  <Link
                    to={`/products/${p._id}`}
                    className="truncate font-medium text-slate-800 hover:text-brand-600 block"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-slate-400">SKU: {p.sku}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {p.totalReviews} lượt
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">{p.averageRating} sao TB</div>
                </div>
              </div>
            ))}
            {data.mostReviewedProducts.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reviews Queue */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Đánh giá cần phản hồi (Pending Queue)</h2>
            <p className="text-xs text-slate-400">Các đánh giá mới chưa có phản hồi từ nhân viên</p>
          </div>
          <Link
            to="/admin/reviews?unreplied=true"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {data.pendingQueue.slice(0, 5).map((r) => {
            const product = typeof r.product === "object" ? r.product : null;
            const customer = typeof r.customer === "object" ? r.customer : null;
            return (
              <div key={r._id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{customer?.name || "Khách hàng"}</span>
                    <span className="text-xs text-slate-400">· {dateTime(r.createdAt)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Sản phẩm: <span className="font-medium text-slate-700">{product?.name}</span>
                  </div>
                  <p className="text-sm text-slate-600">{r.comment || "Không có bình luận"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating value={r.rating} readOnly size={14} />
                  <Link
                    to="/admin/reviews"
                    className="rounded bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                  >
                    Phản hồi
                  </Link>
                </div>
              </div>
            );
          })}
          {data.pendingQueue.length === 0 && (
            <p className="py-6 text-center text-sm text-emerald-600">
              Tuyệt vời! Tất cả đánh giá đều đã được phản hồi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
