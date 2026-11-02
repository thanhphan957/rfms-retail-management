export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type ReviewStatus = "PUBLISHED" | "HIDDEN";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category | string;
  sku: string;
  stock: number;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews?: Review[];
  reviewUrl?: string;
}

export interface Reply {
  _id: string;
  review: string;
  staff: Pick<User, "_id" | "name" | "role"> | User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: Product | string;
  customer: Pick<User, "_id" | "name" | "email" | "avatar"> | User;
  rating: number;
  comment: string;
  status: ReviewStatus;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
  createdAt: string;
  updatedAt: string;
  reply?: Reply | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface DashboardAdmin {
  totalProducts: number;
  totalCustomers: number;
  totalReviews: number;
  averageRating: number;
  unrepliedCount: number;
  recentReviews: Review[];
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  ratingOverTime: { date: string; averageRating: number; count: number }[];
  topRatedProducts: { _id: string; name: string; sku: string; averageRating: number; totalReviews: number }[];
  mostReviewedProducts: { _id: string; name: string; sku: string; averageRating: number; totalReviews: number }[];
  pendingQueue: Review[];
}

export interface DashboardStaff {
  totalReviews: number;
  unrepliedCount: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  pendingQueue: Review[];
}

export interface ReportData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  unrepliedCount: number;
  reviews: Review[];
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
