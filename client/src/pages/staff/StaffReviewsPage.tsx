import { ReviewInbox } from "../../features/reviews/ReviewInbox";

export function StaffReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hộp thư đánh giá & phản hồi</h1>
        <p className="text-sm text-slate-500">
          Xem các đánh giá từ khách hàng và gửi phản hồi chăm sóc khách hàng.
        </p>
      </div>

      <ReviewInbox moderate={false} />
    </div>
  );
}
