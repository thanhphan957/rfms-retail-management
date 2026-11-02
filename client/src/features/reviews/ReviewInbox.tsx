import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Paginated, Review } from "../../types";
import { dateTime } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

export function ReviewInbox({ moderate = false }: { moderate?: boolean }) {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<Paginated<Review> | null>(null);
  const [rating, setRating] = useState("");
  const [unreplied, setUnreplied] = useState(false);
  const [replyFor, setReplyFor] = useState<Review | null>(null);
  const [content, setContent] = useState("");
  const [deleteReply, setDeleteReply] = useState<string | null>(null);
  const [hideId, setHideId] = useState<string | null>(null);

  const load = () => {
    api
      .get("/reviews", { params: { rating: rating || undefined, unreplied: unreplied ? "true" : undefined, limit: 20 } })
      .then((r) => setData(r.data.data))
      .catch((e) => toast.push(getErrorMessage(e), "error"));
  };

  useEffect(() => { load(); }, [rating, unreplied]);

  const submitReply = async () => {
    if (!replyFor) return;
    try {
      if (replyFor.reply) {
        await api.patch(`/replies/${replyFor.reply._id}`, { content });
      } else {
        await api.post("/replies", { reviewId: replyFor._id, content });
      }
      toast.push("Đã lưu phản hồi", "success");
      setReplyFor(null);
      setContent("");
      load();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  const removeReply = async () => {
    if (!deleteReply) return;
    try {
      await api.delete(`/replies/${deleteReply}`);
      toast.push("Đã xóa phản hồi", "success");
      setDeleteReply(null);
      load();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  const toggleStatus = async () => {
    if (!hideId) return;
    const item = data?.items.find((r) => r._id === hideId);
    try {
      await api.patch(`/reviews/${hideId}`, { status: item?.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN" });
      toast.push("Đã cập nhật trạng thái", "success");
      setHideId(null);
      load();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select className="input max-w-xs" value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">Tất cả sao</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sao</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unreplied} onChange={(e) => setUnreplied(e.target.checked)} />
          Chưa trả lời
        </label>
      </div>
      {!data?.items.length && <div className="mt-6"><EmptyState title="Không có đánh giá" /></div>}
      <div className="mt-4 space-y-3">
        {data?.items.map((r) => {
          const product = typeof r.product === "object" ? r.product : null;
          const customer = typeof r.customer === "object" ? r.customer : null;
          return (
            <div key={r._id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <b>{product?.name}</b>
                  <div className="text-sm text-slate-500">{customer?.name} · {dateTime(r.createdAt)} · {r.status}</div>
                  <StarRating value={r.rating} readOnly size={14} />
                  <p className="mt-1 text-sm">{r.comment}</p>
                  {r.reply && <p className="mt-2 rounded bg-slate-50 p-2 text-sm">Reply: {r.reply.content}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn-primary" onClick={() => { setReplyFor(r); setContent(r.reply?.content || ""); }}>
                    {r.reply ? "Sửa reply" : "Trả lời"}
                  </button>
                  {r.reply && (
                    <button className="btn-danger" onClick={() => setDeleteReply(r.reply!._id)}>Xóa reply</button>
                  )}
                  {moderate && (
                    <button className="btn-secondary" onClick={() => setHideId(r._id)}>
                      {r.status === "HIDDEN" ? "Hiện" : "Ẩn"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {replyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-6">
            <h3 className="font-semibold">Phản hồi · {user?.name}</h3>
            <textarea className="input mt-3 min-h-32" value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setReplyFor(null)}>Hủy</button>
              <button className="btn-primary" onClick={submitReply}>Lưu</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteReply} title="Xóa phản hồi" message="Xóa phản hồi này?" onClose={() => setDeleteReply(null)} onConfirm={removeReply} />
      <ConfirmDialog open={!!hideId} title="Đổi trạng thái" message="Cập nhật ẩn/hiện đánh giá này?" onClose={() => setHideId(null)} onConfirm={toggleStatus} />
    </div>
  );
}
