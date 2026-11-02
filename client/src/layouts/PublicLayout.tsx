import { Link, NavLink, Outlet } from "react-router-dom";
import { Boxes, LogIn, UserRound, ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export function PublicLayout() {
  const { user } = useAuth();
  const { count } = useCart();
  const dash =
    user?.role === "ADMIN" ? "/admin/dashboard" : user?.role === "STAFF" ? "/staff/dashboard" : "/customer/reviews";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-brand-700">
            <Boxes /> RFMS
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/products" className={({ isActive }) => (isActive ? "font-semibold text-brand-700" : "text-slate-600")}>
              Sản phẩm
            </NavLink>
            <Link to="/cart" className="relative text-slate-600 hover:text-brand-700">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
            {user ? (
              <Link to={dash} className="btn-primary py-2">
                <UserRound size={16} /> {user.name}
              </Link>
            ) : (
              <Link to="/login" className="btn-primary py-2">
                <LogIn size={16} /> Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
