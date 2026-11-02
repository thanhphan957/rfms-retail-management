import { Star, UserRound, Package } from "lucide-react";
import { AppShell } from "./AppShell";

export function CustomerLayout() {
  return (
    <AppShell
      title="Khách hàng"
      items={[
        { to: "/customer/profile", label: "Hồ sơ", icon: UserRound },
        { to: "/customer/orders", label: "Đơn hàng", icon: Package },
        { to: "/customer/reviews", label: "Đánh giá của tôi", icon: Star },
      ]}
    />
  );
}
