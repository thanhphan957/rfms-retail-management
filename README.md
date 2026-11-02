# RFMS — Retail Feedback Management System
> Hệ thống Quản lý Phản hồi & Đánh giá cho Cửa hàng Bán lẻ

---

## 1. Project Overview (Tổng quan)
**RFMS (Retail Feedback Management System)** là giải pháp web app hoàn chỉnh cho các chuỗi cửa hàng bán lẻ và siêu thị tiện lợi, giúp:
- Quản lý danh mục, sản phẩm, tồn kho và xuất mã **QR Code đánh giá**.
- Cho phép khách hàng truy cập trực tiếp bằng mã QR tại quầy/trên bao bì để xem thông tin, thêm vào giỏ hàng và đặt hàng.
- **Quy trình mua sắm & đánh giá thực tế**: Bắt buộc khách hàng phải mua sản phẩm trước khi gửi đánh giá, kèm tính năng quản lý đơn hàng và hủy đơn tự động hoàn kho.
- Hỗ trợ nhân viên (Staff) xem và gửi phản hồi chăm sóc khách hàng.
- Cung cấp cho Ban quản trị (Admin) hệ thống phân tích KPI, biểu đồ trực quan, kiểm duyệt đánh giá, quản trị người dùng và xuất báo cáo CSV.
- Kiến trúc sẵn sàng tích hợp AI Sentiment Analysis mà không gián đoạn hệ thống hiện tại.

---

## 2. Architecture & Tech Stack (Kiến trúc & Công nghệ)

```
retail-management-system/
├── client/          # React 18, Vite, TypeScript, Tailwind CSS, Recharts, React Router
└── server/          # Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, Zod
```

### Frontend
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **State & Form**: React Hook Form, Zod, Context API (Auth, Toast)
- **Visuals & Charts**: Recharts, Lucide React
- **QR Generator**: `qrcode.react` (SVG)

### Backend
- **Runtime**: Node.js + Express (TypeScript)
- **Database**: MongoDB + Mongoose ORM
- **Security**: Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, bcryptjs
- **Auth**: JWT (Access Token & Refresh Token)
- **Validation**: Zod schema middleware
- **Documentation**: Swagger / OpenAPI (`/api/docs`)
- **Testing**: Jest, Supertest, mongodb-memory-server

---

## 3. Demo Accounts (Tài khoản thử nghiệm)

Hệ thống đã được nạp sẵn dữ liệu demo từ database seed:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@rfms.local` | `Admin@123` | Toàn quyền quản trị, Dashboard biểu đồ, CRUD Sản phẩm, Danh mục, Người dùng, Kiểm duyệt review, Xuất báo cáo CSV |
| **STAFF** | `staff@rfms.local` | `Staff@123` | Dashboard nhân viên, Xem danh sách review, Trả lời review, Sửa/xóa reply của mình |
| **CUSTOMER** | `customer1@rfms.local` | `Customer@123` | Xem chi tiết sản phẩm & QR, Gửi review, Sửa/xóa review của chính mình |
| **CUSTOMER 2** | `customer2@rfms.local` | `Customer@123` | Khách hàng 2 |
| **CUSTOMER 3** | `customer3@rfms.local` | `Customer@123` | Khách hàng 3 |

---

## 4. Environment Variables (Biến môi trường)

### Server (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/rfms
JWT_ACCESS_SECRET=rfms-dev-access-secret-change-in-prod
JWT_REFRESH_SECRET=rfms-dev-refresh-secret-change-in-prod
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
AI_PROVIDER=
```

### Client (`client/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Cài đặt & Chạy dự án (Installation & Running)

### Bước 1: Khởi động Database (MongoDB)
Đảm bảo dịch vụ MongoDB đang chạy tại cổng mặc định `mongodb://127.0.0.1:27017`.

### Bước 2: Chạy Backend Server
Mở terminal tại thư mục `server`:
```bash
cd server
npm install
npm run seed      # Nạp dữ liệu mẫu: 1 Admin, 1 Staff, 3 Khách, 10 Danh mục, 20 Sản phẩm, 30 Reviews
npm run dev       # Khởi động server tại http://localhost:5000
```
Swagger UI tài liệu API: `http://localhost:5000/api/docs`

### Bước 3: Chạy Frontend Client
Mở terminal thứ hai tại thư mục `client`:
```bash
cd client
npm install
npm run dev       # Khởi động Vite client tại http://localhost:5173
```

---

## 6. Lệnh Build & Test

### Chạy Unit & Security Tests (Backend)
```bash
cd server
npm test
```
*Bao gồm test RBAC Ownership: Đảm bảo Customer A không thể xem, sửa hoặc xóa review của Customer B.*

### Build Production
```bash
# Build Backend
cd server
npm run build     # Biên dịch TypeScript ra thư mục dist/

# Build Frontend
cd client
npm run build     # Biên dịch bundle sản xuất tối ưu vào dist/
```

---

## 7. Tài liệu API Endpoints

- `POST /api/auth/register` : Đăng ký khách hàng
- `POST /api/auth/login` : Đăng nhập
- `POST /api/auth/refresh` : Cấp lại access token
- `POST /api/auth/logout` : Đăng xuất
- `GET /api/auth/me` : Lấy thông tin user hiện tại
- `GET /api/products` : Danh sách sản phẩm (Lọc, tìm kiếm, phân trang)
- `GET /api/products/:id` : Chi tiết sản phẩm, điểm trung bình sao, reviews, QR Code
- `POST /api/products` : Tạo sản phẩm mới (Admin)
- `PATCH /api/products/:id` : Sửa sản phẩm (Admin)
- `DELETE /api/products/:id` : Xóa sản phẩm (Admin)
- `GET /api/categories` : Danh sách danh mục
- `POST /api/categories` : Tạo danh mục (Admin)
- `GET /api/reviews` : Xem danh sách review (Staff / Admin)
- `GET /api/reviews/me` : Xem review của chính mình (Customer)
- `POST /api/reviews` : Gửi review sản phẩm (Customer)
- `PATCH /api/reviews/:id` : Sửa review (Customer sửa bài mình / Admin sửa trạng thái)
- `DELETE /api/reviews/:id` : Xóa review (Customer xóa bài mình / Admin)
- `POST /api/replies` : Trả lời review của khách (Staff / Admin)
- `PATCH /api/replies/:id` : Sửa reply (Staff / Admin)
- `DELETE /api/replies/:id` : Xóa reply (Staff / Admin)
- `GET /api/dashboard` : Thống kê Admin (Charts, Top rated, Pending queue)
- `GET /api/dashboard/staff` : Thống kê Staff (Pending reviews)
- `GET /api/reports` : Báo cáo thống kê tổng hợp (Lọc theo ngày, rating, sản phẩm)
- `GET /api/reports/export` : Tải file báo cáo định dạng CSV
- `POST /api/orders` : Đặt hàng từ giỏ hàng & trừ tồn kho (Customer)
- `GET /api/orders/me` : Lịch sử đơn hàng của tôi (Customer)
- `PATCH /api/orders/:id/cancel` : Hủy đơn hàng & hoàn lại tồn kho (Customer)
- `GET /api/orders/check/:productId` : Kiểm tra trạng thái đã mua sản phẩm (Customer)
