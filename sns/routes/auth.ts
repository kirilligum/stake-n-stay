import { Router } from "../deps.ts";
import { signup, login, logout } from "../handlers/auth.ts";

const router = new Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", logout); // No auth middleware for logout itself

export default router;
