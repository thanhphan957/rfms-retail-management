import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { changePasswordSchema, loginSchema, registerSchema } from "../validators/auth.validators";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Try again later." },
});

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/logout", authenticate, controller.logout);
router.post("/refresh", controller.refresh);
router.get("/me", authenticate, controller.me);
router.patch("/change-password", authenticate, validate(changePasswordSchema), controller.changePassword);

export default router;
