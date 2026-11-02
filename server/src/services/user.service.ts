import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/hash";
import { escapeRegex, stripDangerousHtml } from "../utils/sanitize";
import { paginated, parsePagination } from "../utils/pagination";
import { UserRole } from "../types";

export async function listUsers(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.q) {
    const q = escapeRegex(String(query.q));
    filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

export async function getUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}) {
  const exists = await User.findOne({ email: input.email });
  if (exists) throw new ApiError(409, "Email is already registered");
  return User.create({
    name: stripDangerousHtml(input.name),
    email: input.email,
    password: await hashPassword(input.password),
    role: input.role,
    isActive: input.isActive ?? true,
  });
}

export async function updateUser(
  id: string,
  input: { name?: string; role?: UserRole; isActive?: boolean; avatar?: string },
  actorId: string,
) {
  if (id === actorId && input.isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  if (input.name) user.name = stripDangerousHtml(input.name);
  if (input.role) user.role = input.role;
  if (typeof input.isActive === "boolean") user.isActive = input.isActive;
  if (typeof input.avatar === "string") user.avatar = input.avatar;
  await user.save();
  return user;
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw new ApiError(400, "You cannot delete your own account");
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
}
