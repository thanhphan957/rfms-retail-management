import { Router } from "express";
import * as controller from "../controllers/category.controller";
import { authenticate, optionalAuth } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { categorySchema } from "../validators/catalog.validators";
import { idParamSchema } from "../validators/user.validators";

const router = Router();

router.get("/", optionalAuth, controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", authenticate, authorize("ADMIN"), validate(categorySchema), controller.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(categorySchema.partial()), controller.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), controller.remove);

export default router;
