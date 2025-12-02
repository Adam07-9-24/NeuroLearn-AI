import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/adminController";

const router = Router();

// GET /api/admin/stats  (solo ADMIN)
router.get("/stats", requireAuth, requireAdmin, getDashboardStats);

export default router;
