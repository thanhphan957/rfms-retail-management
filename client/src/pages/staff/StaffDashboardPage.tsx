import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, AlertCircle, Star, ArrowRight } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { DashboardStaff } from "../../types";
import { PageSkeleton } from "../../components/Skeleton";
import { ErrorState } from "../../components/ErrorState";
import { StarRating } from "../../components/StarRating";
import { dateTime } from "../../utils/format";

export function StaffDashboardPage() {
  const [data, setData] = useState<DashboardStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    api
      .get("/dashboard/staff")
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
        <h1 className="text-2xl font-bold text-slate-800">Nhân viên · Bảng điều khiển</h1>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển Nhân viên</h1>
        <p className="text-sm text-slate-500">
          Theo dõi các đánh giá cần phản hồi và mức độ hài lòng của khách hàng đối với cửa hàng.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cần phản hồi ngay
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-500">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-rose-600">{data.unrepliedCount}</div>
          <Link
            to="/staff/reviews"
            className="mt-2 inline-flex items-center text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            Vào hộp thư trả lời <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tổng số đánh giá
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-800">{data.totalReviews}</div>
          <span className="text-xs text-slate-400 mt-2 block">Toàn bộ phản hồi nhận được</span>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Điểm số đánh giá TB
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-500">
              <Star size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{data.averageRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-1">
            <StarRating value={Math.round(data.averageRating)} readOnly size={14} />
          </div>
        </div>
      </div>

      {/* Distribution Card */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800">Phân bố đánh giá sao</h2>
        <div className="mt-4 space-y-3">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = data.ratingDistribution[s as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = data.totalReviews ? Math.round((count / data.totalReviews) * 100) : 0;
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

      {/* Pending Reviews Queue */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Danh sách cần xử lý phản hồi</h2>
            <p className="text-xs text-slate-400">Ưu tiên phản hồi khách hàng để nâng cao trải nghiệm</p>
          </div>
          <Link
            to="/staff/reviews"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Mở toàn bộ
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {data.pendingQueue.map((r) => {
            const product = typeof r.product === "object" ? r.product : null;
            const customer = typeof r.customer === "object" ? r.customer : null;
            return (
              <div key={r._id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {customer?.name || "Khách hàng"}
                    </span>
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
                    to="/staff/reviews"
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Trả lời
                  </Link>
                </div>
              </div>
            );
          })}
          {data.pendingQueue.length === 0 && (
            <p className="py-6 text-center text-sm text-emerald-600">
              Hiện không có đánh giá nào chưa được phản hồi!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
