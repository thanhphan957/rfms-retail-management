import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id"),
});
