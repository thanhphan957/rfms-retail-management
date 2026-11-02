import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { homeForRole, useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getErrorMessage } from "../../services/api";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    try {
      const user = await login(values.email, values.password);
      toast.push("Đăng nhập thành công", "success");
      navigate(from || homeForRole(user.role), { replace: true });
    } catch (e) {
      toast.push(getErrorMessage(e, "Đăng nhập thất bại"), "error");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Dùng tài khoản demo trong README nếu cần.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input className="input" type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Chưa có tài khoản? <Link to="/register" className="text-brand-600 font-medium">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
