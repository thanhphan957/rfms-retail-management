import { Router } from "express";
import * as controller from "../controllers/order.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.post("/", controller.create);
router.get("/me", controller.listMine);
router.get("/check/:productId", controller.checkPurchased);

export default router;
