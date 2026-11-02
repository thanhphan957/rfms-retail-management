import { Request } from "express";
import { Types } from "mongoose";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type ReviewStatus = "PUBLISHED" | "HIDDEN";
export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtAccessPayload {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
}

export type ObjectIdLike = Types.ObjectId | string;
