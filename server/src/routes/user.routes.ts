import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createUserSchema, idParamSchema, updateUserSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/", controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.post("/", validate(createUserSchema), controller.create);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateUserSchema), controller.update);
router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

export default router;
