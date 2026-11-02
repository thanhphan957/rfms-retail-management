import { Router } from "express";
import * as controller from "../controllers/reply.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createReplySchema, updateReplySchema } from "../validators/review.validators";
import { idParamSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate, authorize("ADMIN", "STAFF"));
router.post("/", validate(createReplySchema), controller.create);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateReplySchema), controller.update);
router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

export default router;
