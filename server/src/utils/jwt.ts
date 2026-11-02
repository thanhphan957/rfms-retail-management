import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtAccessPayload } from "../types";

export function signAccessToken(payload: JwtAccessPayload): string {
  const options: SignOptions = { expiresIn: env.accessTokenExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtAccessPayload;
}

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * (map[unit] || 86_400_000);
}
