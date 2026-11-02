import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api, { getErrorMessage } from "../../services/api";
import { Category } from "../../types";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { PageSkeleton } from "../../components/Skeleton";
import { useToast } from "../../contexts/ToastContext";

const catSchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CatFormData = z.infer<typeof catSchema>;

export function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatFormData>({
    resolver: zodResolver(catSchema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const loadCategories = () => {
    setLoading(true);
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => toast.push(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    reset({ name: "", description: "", isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    reset({ name: cat.name, description: cat.description || "", isActive: cat.isActive });
    setModalOpen(true);
  };

  const onSubmit = async (values: CatFormData) => {
    try {
      if (editingCat) {
        await api.patch(`/categories/${editingCat._id}`, values);
        toast.push("Cập nhật danh mục thành công", "success");
      } else {
        await api.post("/categories", values);
        toast.push("Tạo danh mục mới thành công", "success");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.push(getErrorMessage(err, "Thao tác thất bại"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.push("Đã xóa danh mục", "success");
      setDeleteId(null);
      loadCategories();
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể xóa danh mục"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý danh mục</h1>
          <p className="text-sm text-slate-500">
            Phân loại hàng hóa trong cửa hàng phục vụ tìm kiếm và quản lý sản phẩm.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Chưa có danh mục nào"
          hint="Hãy tạo danh mục đầu tiên để gắn kết với sản phẩm."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Tên danh mục</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{c.slug}</td>
                    <td className="px-6 py-4 text-slate-500">{c.description || "—"}</td>
                    <td className="px-6 py-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <XCircle size={12} /> Tạm dừng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          title="Sửa danh mục"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c._id)}
                          title="Xóa danh mục"
                          className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingCat ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Tên danh mục *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="VD: Đồ uống"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Mô tả</label>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="Mô tả nhóm sản phẩm..."
                  {...register("description")}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  {...register("isActive")}
                />
                <label htmlFor="catActive" className="text-sm font-medium text-slate-700">
                  Kích hoạt sử dụng danh mục
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Xác nhận xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động không thể hoàn tác nếu danh mục đang gắn với sản phẩm."
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
