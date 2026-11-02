import { Reply } from "../models/Reply";
import { Review } from "../models/Review";
import { ApiError } from "../utils/ApiError";
import { stripDangerousHtml } from "../utils/sanitize";
import { AuthUser } from "../types";

export async function createReply(actor: AuthUser, input: { reviewId: string; content: string }) {
  const review = await Review.findById(input.reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  const exists = await Reply.findOne({ review: input.reviewId });
  if (exists) throw new ApiError(409, "This review already has a reply");
  const reply = await Reply.create({
    review: input.reviewId,
    staff: actor.id,
    content: stripDangerousHtml(input.content),
  });
  return reply.populate("staff", "name role");
}

export async function updateReply(id: string, actor: AuthUser, content: string) {
  const reply = await Reply.findById(id);
  if (!reply) throw new ApiError(404, "Reply not found");
  if (actor.role === "STAFF" && String(reply.staff) !== actor.id) {
    throw new ApiError(403, "You can only edit your own replies");
  }
  reply.content = stripDangerousHtml(content);
  await reply.save();
  return reply.populate("staff", "name role");
}

export async function deleteReply(id: string, actor: AuthUser) {
  const reply = await Reply.findById(id);
  if (!reply) throw new ApiError(404, "Reply not found");
  if (actor.role === "STAFF" && String(reply.staff) !== actor.id) {
    throw new ApiError(403, "You can only delete your own replies");
  }
  await reply.deleteOne();
  return reply;
}
