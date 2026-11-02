import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { StaffLayout } from "./layouts/StaffLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";

// Public pages
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ProductListPage } from "./pages/public/ProductListPage";
import { ProductDetailPage } from "./pages/public/ProductDetailPage";
import { ReviewByQrPage } from "./pages/public/ReviewByQrPage";
import { CartPage } from "./pages/public/CartPage";

// Customer pages
import { ProfilePage } from "./pages/customer/ProfilePage";
import { MyReviewsPage } from "./pages/customer/MyReviewsPage";
import { MyOrdersPage } from "./pages/customer/MyOrdersPage";

// Staff pages
import { StaffDashboardPage } from "./pages/staff/StaffDashboardPage";
import { StaffReviewsPage } from "./pages/staff/StaffReviewsPage";

// Admin pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReviewsPage } from "./pages/admin/AdminReviewsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/review/:productId" element={<ReviewByQrPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={["CUSTOMER"]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/reviews" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="reviews" element={<MyReviewsPage />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["STAFF", "ADMIN"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route path="reviews" element={<StaffReviewsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/create" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
