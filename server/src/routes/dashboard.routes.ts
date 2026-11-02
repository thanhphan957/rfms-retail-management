import { Router } from "express";
import * as controller from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), controller.admin);
router.get("/staff", authenticate, authorize("STAFF", "ADMIN"), controller.staff);

export default router;
