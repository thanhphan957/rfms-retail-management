import { BarChart3, FolderTree, LayoutDashboard, MessageSquare, Package, Users } from "lucide-react";
import { AppShell } from "./AppShell";

export function AdminLayout() {
  return (
    <AppShell
      title="Quản trị"
      items={[
        { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/products", label: "Sản phẩm", icon: Package },
        { to: "/admin/categories", label: "Danh mục", icon: FolderTree },
        { to: "/admin/users", label: "Người dùng", icon: Users },
        { to: "/admin/reviews", label: "Đánh giá", icon: MessageSquare },
        { to: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
      ]}
    />
  );
}
