import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { generarPptHandler } from "../controllers/pptController";

const router = Router();

// Solo docentes, si luego quieres, puedes crear requireDocente
router.post("/generar", requireAuth, generarPptHandler);

export default router;
