import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Paginated, Review } from "../../types";
import { dateTime } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../contexts/ToastContext";
import { Link } from "react-router-dom";

export function MyReviewsPage() {
  const [data, setData] = useState<Paginated<Review> | null>(null);
  const [edit, setEdit] = useState<Review | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [delId, setDelId] = useState<string | null>(null);
  const toast = useToast();

  const load = () => {
    api.get("/reviews/me").then((r) => setData(r.data.data)).catch((e) => toast.push(getErrorMessage(e), "error"));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    try {
      await api.patch(`/reviews/${edit._id}`, { rating, comment });
      toast.push("Đã cập nhật đánh giá", "success");
      setEdit(null);
      load();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  const remove = async () => {
    if (!delId) return;
    try {
      await api.delete(`/reviews/${delId}`);
      toast.push("Đã xóa đánh giá", "success");
      setDelId(null);
      load();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Đánh giá của tôi</h1>
      {!data?.items.length && <div className="mt-6"><EmptyState title="Bạn chưa đánh giá sản phẩm nào" /></div>}
      <div className="mt-6 space-y-3">
        {data?.items.map((r) => {
          const product = typeof r.product === "object" ? r.product : null;
          return (
            <div key={r._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/products/${product?._id}`} className="font-semibold hover:text-brand-700">{product?.name}</Link>
                  <div className="mt-1"><StarRating value={r.rating} readOnly size={14} /></div>
                  <p className="mt-2 text-sm">{r.comment}</p>
                  {r.reply && <p className="mt-2 text-sm text-slate-500">Staff: {r.reply.content}</p>}
                  <p className="mt-1 text-xs text-slate-400">{dateTime(r.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => { setEdit(r); setComment(r.comment); setRating(r.rating); }}>Sửa</button>
                  <button className="btn-danger" onClick={() => setDelId(r._id)}>Xóa</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="font-semibold">Sửa đánh giá</h3>
            <div className="mt-3"><StarRating value={rating} onChange={setRating} /></div>
            <textarea className="input mt-3 min-h-28" value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setEdit(null)}>Hủy</button>
              <button className="btn-primary" onClick={save}>Lưu</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} title="Xóa đánh giá" message="Bạn chắc chắn muốn xóa đánh giá này?" onClose={() => setDelId(null)} onConfirm={remove} />
    </div>
  );
}
