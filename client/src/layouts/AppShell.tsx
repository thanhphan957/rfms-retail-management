import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Boxes, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LucideIcon } from "lucide-react";

export function AppShell({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string; icon: LucideIcon }[];
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} /> {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-900 text-white md:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-5 text-lg font-semibold">
          <Boxes /> RFMS
        </Link>
        <p className="px-5 pb-3 text-xs uppercase tracking-wider text-slate-400">{title}</p>
        {nav}
        <div className="border-t border-white/10 p-4 text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-slate-400">{user?.role}</div>
          <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-slate-300 hover:text-white">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Menu />
          </button>
          <div className="font-semibold text-slate-800">{title}</div>
          <Link to="/products" className="text-sm text-slate-500 hover:text-brand-700">
            Cửa hàng
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-brand-900 text-white">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="flex items-center gap-2 font-semibold">
                <Boxes /> RFMS
              </span>
              <button onClick={() => setOpen(false)} aria-label="Đóng">
                <X />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </div>
  );
}
