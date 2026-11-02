import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getErrorMessage } from "../../services/api";

const schema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    try {
      await signup(values.name, values.email, values.password);
      toast.push("Tạo tài khoản thành công", "success");
      navigate("/products");
    } catch (e) {
      toast.push(getErrorMessage(e, "Đăng ký thất bại"), "error");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Đăng ký khách hàng</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">Họ tên</label>
            <input className="input" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>
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
            {isSubmitting ? "Đang tạo..." : "Đăng ký"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Đã có tài khoản? <Link to="/login" className="text-brand-600 font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
