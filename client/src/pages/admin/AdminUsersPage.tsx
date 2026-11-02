import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Shield, UserCheck, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api, { getErrorMessage } from "../../services/api";
import { Paginated, User, UserRole } from "../../types";
import { dateTime } from "../../utils/format";
import { Pagination } from "../../components/Pagination";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { PageSkeleton } from "../../components/Skeleton";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

const createUserSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export function AdminUsersPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "STAFF" },
  });

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/users", {
        params: {
          page,
          limit: 10,
          role: roleFilter || undefined,
          q: search.trim() || undefined,
        },
      })
      .then((res) => setData(res.data.data))
      .catch((err) => toast.push(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleCreateUser = async (values: CreateUserFormData) => {
    try {
      await api.post("/users", values);
      toast.push("Tạo tài khoản người dùng thành công", "success");
      setModalOpen(false);
      reset();
      loadUsers();
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể tạo người dùng"), "error");
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser._id === currentUser?._id) {
      toast.push("Không thể khóa tài khoản của chính mình", "error");
      return;
    }
    try {
      await api.patch(`/users/${targetUser._id}`, { isActive: !targetUser.isActive });
      toast.push(
        targetUser.isActive ? "Đã khóa tài khoản người dùng" : "Đã kích hoạt lại tài khoản",
        "success",
      );
      loadUsers();
    } catch (err) {
      toast.push(getErrorMessage(err, "Thao tác thất bại"), "error");
    }
  };

  const handleRoleChange = async (targetUser: User, newRole: UserRole) => {
    if (targetUser._id === currentUser?._id) {
      toast.push("Không thể tự đổi vai trò của chính mình", "error");
      return;
    }
    try {
      await api.patch(`/users/${targetUser._id}`, { role: newRole });
      toast.push(`Đã thay đổi vai trò thành ${newRole}`, "success");
      loadUsers();
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể đổi vai trò"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`);
      toast.push("Đã xóa người dùng thành công", "success");
      setDeleteId(null);
      loadUsers();
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể xóa người dùng"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500">
            Quản trị tài khoản, phân quyền vai trò (Admin, Staff, Customer).
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email người dùng..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              className="input"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="STAFF">Nhân viên (STAFF)</option>
              <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
            </select>
          </div>

          <button type="submit" className="btn-secondary">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <PageSkeleton />
      ) : !data?.items.length ? (
        <EmptyState
          title="Không tìm thấy người dùng"
          hint="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((u) => {
                  const isMe = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {u.name} {isMe && <span className="text-xs text-brand-600 font-normal">(Bạn)</span>}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        {isMe ? (
                          <span className="font-semibold text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                            {u.role}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className="text-xs font-semibold rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="STAFF">STAFF</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isMe}
                          title={isMe ? "Không thể khóa tài khoản của chính mình" : "Bấm để đổi trạng thái"}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          } ${isMe ? "cursor-default opacity-80" : "cursor-pointer"}`}
                        >
                          {u.isActive ? (
                            <>
                              <UserCheck size={12} /> Hoạt động
                            </>
                          ) : (
                            <>
                              <UserX size={12} /> Bị khóa
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{dateTime(u.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {!isMe && (
                          <button
                            onClick={() => setDeleteId(u._id)}
                            title="Xóa người dùng"
                            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <Pagination
              meta={data.pagination}
              onPage={(p: number) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-brand-600">
              <Shield size={20} />
              <h3 className="text-lg font-bold text-slate-800">Thêm người dùng mới</h3>
            </div>
            <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
              <div>
                <label className="label">Họ và tên *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="VD: Nguyễn Văn A"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="user@example.com"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Mật khẩu *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Tối thiểu 6 ký tự"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Phân quyền vai trò *</label>
                <select className="input" {...register("role")}>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-sm"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Xác nhận xóa tài khoản"
        message="Hành động này sẽ xóa người dùng này vĩnh viễn khỏi hệ thống. Bạn có chắc chắn muốn thực hiện?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
