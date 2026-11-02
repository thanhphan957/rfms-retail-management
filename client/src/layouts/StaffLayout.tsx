import { LayoutDashboard, MessageSquare } from "lucide-react";
import { AppShell } from "./AppShell";

export function StaffLayout() {
  return (
    <AppShell
      title="Nhân viên"
      items={[
        { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/staff/reviews", label: "Đánh giá", icon: MessageSquare },
      ]}
    />
  );
}
