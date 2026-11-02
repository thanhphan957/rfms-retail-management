import { Pagination as P } from "../types";

export function Pagination({
  meta,
  onPage,
}: {
  meta: P;
  onPage: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button className="btn-secondary" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        Trước
      </button>
      <span className="text-sm text-slate-600">
        Trang {meta.page}/{meta.totalPages} · {meta.total} mục
      </span>
      <button className="btn-secondary" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
        Sau
      </button>
    </div>
  );
}
