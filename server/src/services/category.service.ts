import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { slugify, stripDangerousHtml } from "../utils/sanitize";

export async function listCategories(activeOnly = false) {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ name: 1 });
}

export async function getCategory(id: string) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
}

export async function createCategory(input: { name: string; description?: string; isActive?: boolean }) {
  const name = stripDangerousHtml(input.name);
  return Category.create({
    name,
    slug: slugify(name),
    description: stripDangerousHtml(input.description || ""),
    isActive: input.isActive ?? true,
  });
}

export async function updateCategory(
  id: string,
  input: { name?: string; description?: string; isActive?: boolean },
) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");
  if (input.name) {
    category.name = stripDangerousHtml(input.name);
    category.slug = slugify(category.name);
  }
  if (typeof input.description === "string") category.description = stripDangerousHtml(input.description);
  if (typeof input.isActive === "boolean") category.isActive = input.isActive;
  await category.save();
  return category;
}

export async function deleteCategory(id: string) {
  const count = await Product.countDocuments({ category: id });
  if (count > 0) throw new ApiError(400, "Cannot delete category that still has products");
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
}
