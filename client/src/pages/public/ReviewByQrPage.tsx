import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ShoppingCart } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Product } from "../../types";
import { money } from "../../utils/format";
import { StarRating } from "../../components/StarRating";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
});
type Form = z.infer<typeof schema>;

export function ReviewByQrPage() {
  const { productId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, comment: "" },
  });

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then((r) => setProduct(r.data.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, [productId]);

  useEffect(() => {
    if (user && user.role === "CUSTOMER" && productId) {
      setCheckingPurchase(true);
      api.get(`/orders/check/${productId}`)
        .then((r) => setHasPurchased(r.data.data.purchased))
        .catch(() => setHasPurchased(false))
        .finally(() => setCheckingPurchase(false));
    } else {
      setHasPurchased(null);
    }
  }, [user, productId]);

  const onSubmit = async (values: Form) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.push("Chỉ khách hàng mới gửi được đánh giá", "error");
      return;
    }
    if (hasPurchased === false) {
      toast.push("Bạn cần mua sản phẩm này trước khi có thể đánh giá", "error");
      return;
    }
    try {
      await api.post("/reviews", { productId, rating: values.rating, comment: values.comment || "" });
      toast.push("Đã gửi đánh giá thành công!", "success");
      navigate(`/products/${productId}`);
    } catch (e) {
      toast.push(getErrorMessage(e, "Không gửi được đánh giá"), "error");
    }
  };

  if (error) return <div className="mx-auto max-w-lg px-4 py-10"><ErrorState message={error} /></div>;
  if (!product) return <div className="mx-auto max-w-lg px-4 py-10"><Skeleton className="h-80" /></div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="card overflow-hidden">
        <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
        <div className="p-6">
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="mt-1 text-brand-700 font-semibold">{money(product.price)}</p>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>

          {!user && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Bạn cần{" "}
              <Link className="font-semibold text-brand-700 underline" to="/login" state={{ from: location.pathname }}>
                đăng nhập
              </Link>{" "}
              để gửi đánh giá.
            </p>
          )}

          {user && user.role === "CUSTOMER" && checkingPurchase && (
            <div className="mt-4 text-sm text-slate-500">Đang kiểm tra lịch sử mua hàng...</div>
          )}

          {user && user.role === "CUSTOMER" && !checkingPurchase && hasPurchased === false && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-sm">Chưa thể đánh giá sản phẩm</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Chính sách cửa hàng yêu cầu bạn phải từng mua sản phẩm này trước khi có thể viết đánh giá.
                  </p>
                  <Link
                    to={`/products/${productId}`}
                    className="btn-primary mt-3 inline-flex text-xs py-1.5 px-3 items-center gap-1.5"
                  >
                    <ShoppingCart size={14} /> Đi đến trang sản phẩm để mua
                  </Link>
                </div>
              </div>
            </div>
          )}

          {(!user || user.role !== "CUSTOMER" || hasPurchased) && (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="label">Số sao</label>
                <StarRating
                  value={rating}
                  onChange={(n) => { setRating(n); setValue("rating", n); }}
                  size={28}
                />
              </div>
              <div>
                <label className="label">Bình luận</label>
                <textarea
                  className="input min-h-28"
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
                  {...register("comment")}
                />
              </div>
              <button
                className="btn-primary w-full"
                disabled={isSubmitting || !user || user.role !== "CUSTOMER"}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
