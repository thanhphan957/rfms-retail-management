import { ReviewInbox } from "../../features/reviews/ReviewInbox";

export function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý & Kiểm duyệt đánh giá</h1>
        <p className="text-sm text-slate-500">
          Xem toàn bộ đánh giá của khách hàng, kiểm duyệt ẩn/hiện và quản lý phản hồi từ nhân viên.
        </p>
      </div>

      <ReviewInbox moderate={true} />
    </div>
  );
}
