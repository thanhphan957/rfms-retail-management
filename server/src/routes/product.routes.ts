import { Router } from "express";
import * as controller from "../controllers/product.controller";
import { authenticate, optionalAuth } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { productSchema, productUpdateSchema } from "../validators/catalog.validators";
import { idParamSchema } from "../validators/user.validators";

const router = Router();

router.get("/", optionalAuth, controller.list);
router.get("/:id", optionalAuth, validate(idParamSchema, "params"), controller.getById);
router.get("/:id/qr", authenticate, authorize("ADMIN", "STAFF"), validate(idParamSchema, "params"), controller.qr);
router.post("/", authenticate, authorize("ADMIN"), validate(productSchema), controller.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(productUpdateSchema), controller.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), controller.remove);

export default router;
