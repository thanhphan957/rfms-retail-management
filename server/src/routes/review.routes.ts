import { Router } from "express";
import * as controller from "../controllers/review.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createReviewSchema, updateReviewSchema } from "../validators/review.validators";
import { idParamSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate);
router.get("/", authorize("ADMIN", "STAFF"), controller.list);
router.get("/me", authorize("CUSTOMER"), controller.listMine);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", authorize("CUSTOMER"), validate(createReviewSchema), controller.create);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateReviewSchema), controller.update);
router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

export default router;
