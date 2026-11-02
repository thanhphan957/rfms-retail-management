import { Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/hash";
import { stripDangerousHtml } from "../utils/sanitize";
import {
  clearRefreshCookie,
  issueTokens,
  readRefreshCookie,
  revokeRefreshToken,
  rotateRefreshToken,
} from "./token.service";
import { AuthUser } from "../types";

function toAuthUser(user: { id?: string; _id?: any; role: AuthUser["role"]; email: string; name: string }): AuthUser {
  return { id: String(user.id || user._id), role: user.role, email: user.email, name: user.name };
}

export async function register(input: { name: string; email: string; password: string }, res: Response) {
  const exists = await User.findOne({ email: input.email });
  if (exists) throw new ApiError(409, "Email is already registered");
  const password = await hashPassword(input.password);
  const user = await User.create({
    name: stripDangerousHtml(input.name),
    email: input.email,
    password,
    role: "CUSTOMER",
  });
  const tokens = await issueTokens(toAuthUser(user), res);
  return { user: user.toJSON(), ...tokens };
}

export async function login(input: { email: string; password: string }, res: Response) {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive) throw new ApiError(403, "Account is disabled");
  const ok = await comparePassword(input.password, user.password);
  if (!ok) throw new ApiError(401, "Invalid email or password");
  const tokens = await issueTokens(toAuthUser(user), res);
  const safe = user.toJSON();
  return { user: safe, ...tokens };
}

export async function logout(req: { cookies?: Record<string, string>; user?: AuthUser }, res: Response) {
  const raw = readRefreshCookie(req);
  await revokeRefreshToken(raw, req.user?.id);
  clearRefreshCookie(res);
}

export async function refresh(req: { cookies?: Record<string, string> }, res: Response) {
  const raw = readRefreshCookie(req);
  if (!raw) throw new ApiError(401, "Refresh token missing");
  return rotateRefreshToken(raw, res);
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");
  const ok = await comparePassword(input.currentPassword, user.password);
  if (!ok) throw new ApiError(400, "Current password is incorrect");
  user.password = await hashPassword(input.newPassword);
  await user.save();
  await revokeRefreshToken(undefined, userId);
}
