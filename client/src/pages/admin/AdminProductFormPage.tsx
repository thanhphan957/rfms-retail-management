import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Category } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import { PageSkeleton } from "../../components/Skeleton";

const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  sku: z.string().min(2, "SKU phải có ít nhất 2 ký tự"),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  stock: z.coerce.number().min(0, "Tồn kho phải lớn hơn hoặc bằng 0"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  image: z.string().url("URL ảnh không hợp lệ").or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      stock: 0,
      category: "",
      image: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => toast.push(getErrorMessage(err), "error"));

    if (isEdit) {
      api
        .get(`/products/${id}`)
        .then((res) => {
          const p = res.data.data;
          reset({
            name: p.name,
            sku: p.sku,
            price: p.price,
            stock: p.stock,
            category: typeof p.category === "object" ? p.category._id : p.category,
            image: p.image || "",
            description: p.description || "",
            isActive: p.isActive,
          });
        })
        .catch((err) => toast.push(getErrorMessage(err), "error"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (values: ProductFormData) => {
    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, values);
        toast.push("Cập nhật sản phẩm thành công", "success");
      } else {
        await api.post("/products", values);
        toast.push("Tạo sản phẩm mới thành công", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.push(getErrorMessage(err, "Không thể lưu sản phẩm"), "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit
              ? "Cập nhật các thông tin của sản phẩm trong kho."
              : "Điền đầy đủ thông tin để thêm sản phẩm vào kệ hàng."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="label">Tên sản phẩm *</label>
            <input
              type="text"
              className="input"
              placeholder="VD: Cà phê rang xay Arabica 250g"
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="label">Mã SKU *</label>
            <input
              type="text"
              className="input font-mono uppercase"
              placeholder="VD: CF-001"
              {...register("sku")}
            />
            {errors.sku && <p className="mt-1 text-xs text-rose-500">{errors.sku.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Danh mục *</label>
            <select className="input" {...register("category")}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-500">{errors.category.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="label">Giá bán (VNĐ) *</label>
            <input
              type="number"
              className="input"
              placeholder="100000"
              {...register("price")}
            />
            {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="label">Số lượng tồn kho *</label>
            <input
              type="number"
              className="input"
              placeholder="50"
              {...register("stock")}
            />
            {errors.stock && <p className="mt-1 text-xs text-rose-500">{errors.stock.message}</p>}
          </div>

          {/* Image URL */}
          <div className="sm:col-span-2">
            <label className="label">URL Hình ảnh</label>
            <input
              type="text"
              className="input"
              placeholder="https://images.unsplash.com/photo-..."
              {...register("image")}
            />
            {errors.image && <p className="mt-1 text-xs text-rose-500">{errors.image.message}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="label">Mô tả chi tiết</label>
            <textarea
              rows={4}
              className="input"
              placeholder="Mô tả công dụng, xuất xứ, hạn sử dụng..."
              {...register("description")}
            />
          </div>

          {/* Active status */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              {...register("isActive")}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Đang kinh doanh (Hiển thị công khai trên website)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link to="/admin/products" className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
