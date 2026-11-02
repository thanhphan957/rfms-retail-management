import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
type Form = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    try {
      await api.patch("/auth/change-password", values);
      toast.push("Đã đổi mật khẩu, vui lòng đăng nhập lại", "success");
      await logout();
    } catch (e) {
      toast.push(getErrorMessage(e), "error");
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Hồ sơ</h1>
        <p className="mt-2 text-sm text-slate-600">{user?.name}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <p className="mt-1 text-xs uppercase text-slate-400">{user?.role}</p>
      </div>
      <form className="card space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="font-semibold">Đổi mật khẩu</h2>
        <div>
          <label className="label">Mật khẩu hiện tại</label>
          <input className="input" type="password" {...register("currentPassword")} />
          {errors.currentPassword && <p className="text-xs text-rose-600">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label className="label">Mật khẩu mới</label>
          <input className="input" type="password" {...register("newPassword")} />
          {errors.newPassword && <p className="text-xs text-rose-600">{errors.newPassword.message}</p>}
        </div>
        <button className="btn-primary" disabled={isSubmitting} onClick={() => reset} type="submit">
          Cập nhật mật khẩu
        </button>
      </form>
    </div>
  );
}
