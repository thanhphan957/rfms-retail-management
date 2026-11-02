import { Link } from "react-router-dom";
import { QrCode, ShieldCheck, Star } from "lucide-react";

export function HomePage() {
  return (
    <div>
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-accent-500 text-sm font-semibold uppercase tracking-widest">Retail Feedback</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              Lắng nghe khách hàng. Cải thiện cửa hàng.
            </h1>
            <p className="mt-4 text-slate-300">
              RFMS giúp cửa hàng bán lẻ quản lý sản phẩm, thu thập đánh giá qua QR Code và để nhân viên phản hồi đúng lúc.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/products" className="btn-primary bg-accent-500 hover:bg-amber-400 text-slate-900">
                Xem sản phẩm
              </Link>
              <Link to="/register" className="btn-secondary">
                Tạo tài khoản
              </Link>
            </div>
          </div>
          <div className="card p-6 text-slate-800">
            <h3 className="font-semibold">Quy trình 3 bước</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3"><QrCode className="text-brand-600" /> Khách quét QR trên sản phẩm</li>
              <li className="flex gap-3"><Star className="text-amber-500" /> Chọn 1–5 sao và viết bình luận</li>
              <li className="flex gap-3"><ShieldCheck className="text-emerald-600" /> Staff trả lời, Admin xem dashboard thật từ MongoDB</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
