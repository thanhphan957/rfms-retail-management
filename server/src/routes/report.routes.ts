import { Router } from "express";
import * as controller from "../controllers/report.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/", controller.get);
router.get("/export", controller.exportCsv);

export default router;
