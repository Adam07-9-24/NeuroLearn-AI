import { Router } from "express";
import Course from "../models/Course";
import Quiz from "../models/Quiz";
import StudentQuizProgress from "../models/StudentQuizProgress";
import { requireAuth, type AuthRequest } from "../middleware/authMiddleware";

const router = Router();


router.get("/", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const cursos = await Course.find({ estado: "Activo" }).sort({ nombre: 1 });
    res.json(cursos);
  } catch (error) {
    console.error("Error listando cursos para estudiante:", error);
    res.status(500).json({
      message: "Error al obtener los cursos para el estudiante.",
    });
  }
});


router.get("/curso/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1) Obtener curso
    const curso = await Course.findById(id);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    // 2) Obtener quizzes del curso
    const quizzes = await Quiz.find({ curso: id }).sort({ creadoEn: -1 });

    if (quizzes.length === 0) {
      return res.json({
        curso,
        quizzes: [],
      });
    }

    // 3) Obtener progreso del estudiante en esos quizzes
    const quizIds = quizzes.map((q) => q._id);
    const progresoDocs = await StudentQuizProgress.find({
      user: userId,
      quiz: { $in: quizIds },
      course: id,
    });

    const progresoMap = new Map<
      string,
      { status: "pendiente" | "completado"; score: number | null }
    >();

    progresoDocs.forEach((p) => {
      progresoMap.set(p.quiz.toString(), {
        status: (p.status as "pendiente" | "completado") ?? "pendiente",
        score: (p.score as number | null) ?? null,
      });
    });

    // 4) Mezclar quizzes + estado del estudiante
    const quizzesConEstado = quizzes.map((q) => {
      const base = q.toObject();
      const progreso = progresoMap.get(q._id.toString());

      return {
        ...base,
        estadoEstudiante: progreso?.status ?? "pendiente",
        puntaje: progreso?.score ?? null,
      };
    });

    return res.json({
      curso,
      quizzes: quizzesConEstado,
    });
  } catch (error) {
    console.error(
      "Error obteniendo detalle de curso para estudiante:",
      error
    );
    res.status(500).json({
      message: "Error al obtener el detalle del curso.",
    });
  }
});

export default router;
