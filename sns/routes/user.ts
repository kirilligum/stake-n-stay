import { Router } from "../deps.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { getMe } from "../handlers/user.ts";

const router = new Router();

// Protected route: Get current user's details
router.get("/api/users/me", authMiddleware, getMe);

export default router;
