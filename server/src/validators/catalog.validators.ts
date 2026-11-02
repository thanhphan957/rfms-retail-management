import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().default(""),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(4000).optional().default(""),
  price: z.number().min(0),
  image: z.string().optional().default(""),
  category: z.string().regex(/^[a-f\d]{24}$/i),
  sku: z.string().min(2).max(40),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export const productUpdateSchema = productSchema.partial();
