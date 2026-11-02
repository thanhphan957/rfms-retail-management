import { Response } from "express";
import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";
import { env, isProd } from "../config/env";
import { generateRawToken, hashToken } from "../utils/hash";
import { parseDurationToMs, signAccessToken } from "../utils/jwt";
import { AuthUser } from "../types";
import { ApiError } from "../utils/ApiError";

const COOKIE_NAME = "rfms_refresh";

export function setRefreshCookie(res: Response, rawToken: string) {
  const maxAge = parseDurationToMs(env.refreshTokenExpiresIn);
  res.cookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: env.cookieSecure || isProd,
    sameSite: "lax",
    maxAge,
    path: "/api/auth",
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/api/auth" });
}

export async function issueTokens(user: AuthUser, res: Response) {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  const rawRefresh = generateRawToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.refreshTokenExpiresIn));
  await RefreshToken.create({ user: user.id, tokenHash, expiresAt });
  setRefreshCookie(res, rawRefresh);
  return { accessToken, expiresIn: env.accessTokenExpiresIn };
}

export async function rotateRefreshToken(rawToken: string, res: Response) {
  const tokenHash = hashToken(rawToken);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(stored.user);
  await RefreshToken.deleteOne({ _id: stored._id });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid refresh token");
  }
  return issueTokens(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    res,
  );
}

export async function revokeRefreshToken(rawToken?: string, userId?: string) {
  if (rawToken) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
  } else if (userId) {
    await RefreshToken.deleteMany({ user: userId });
  }
}

export function readRefreshCookie(req: { cookies?: Record<string, string> }): string | undefined {
  return req.cookies?.[COOKIE_NAME];
}
