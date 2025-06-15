import { Router } from "../deps.ts";
import {
  getMyPointTransactions,
  getUserPointTransactions,
  grantPointsToUser,
} from "../handlers/point.ts";
import { adminRequiredMiddleware, authMiddleware } from "../middleware/auth.ts";

const router = new Router();

// GET /api/points/history - Get the authenticated user's point transaction history
router.get(
  "/api/points/history",
  authMiddleware,
  getMyPointTransactions,
);

// POST /api/points/grant - Grant points to a user (Admin only)
router.post(
  "/api/points/grant",
  authMiddleware,
  adminRequiredMiddleware,
  grantPointsToUser,
);

// GET /api/users/:target_user_id/points/history - Get a specific user's point transaction history (Admin only)
router.get(
  "/api/users/:target_user_id/points/history",
  authMiddleware,
  adminRequiredMiddleware,
  getUserPointTransactions,
);

export default router;
