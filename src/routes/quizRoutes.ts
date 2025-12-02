// src/routes/quizRoutes.ts
import { Router } from "express";
import Quiz from "../models/Quiz";
import Course from "../models/Course";
import { generarCodigoQuiz } from "../utils/generarCodigoQuiz";
import {
  requireAuth,
  requireAdmin,
  type AuthRequest,
} from "../middleware/authMiddleware";
import { openai } from "../config/openai";
import StudentQuizProgress from "../models/StudentQuizProgress";

const router = Router();

router.get(
  "/:quizId/estado-estudiante",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;

      const progreso = await StudentQuizProgress.findOne({
        user: userId,
        quiz: quizId,
      }).sort({ finishedAt: -1 });

      if (!progreso) {
        return res.json({
          status: "pendiente",
          score: null,
        });
      }

      return res.json({
        status: progreso.status ?? "pendiente",
        score: progreso.score ?? null,
      });
    } catch (error) {
      console.error("Error obteniendo estado de quiz para estudiante:", error);
      return res.status(500).json({
        message: "Error al obtener el estado del quiz.",
      });
    }
  }
);

/* ============================================================
   1. CREAR QUIZ MANUAL
   ============================================================ */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { titulo, curso } = req.body;

    if (!titulo || !curso) {
      return res
        .status(400)
        .json({ message: "El título y el curso son obligatorios." });
    }

    const existe = await Course.findById(curso);
    if (!existe) {
      return res.status(404).json({ message: "El curso no existe." });
    }

    const nuevo = await Quiz.create({
      titulo,
      curso,
      preguntas: [],
      estado: "Borrador",
    });

    await Course.findByIdAndUpdate(curso, { $inc: { totalQuizzes: 1 } });

    return res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error creando quiz:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   2. CREAR QUIZ CON IA (desde texto)
   ============================================================ */
router.post(
  "/generar-desde-texto",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { titulo, cursoId, texto, numPreguntas } = req.body;

      if (!titulo || !cursoId || !texto) {
        return res.status(400).json({
          message: "Titulo, cursoId y texto son obligatorios.",
        });
      }

      const cantidad = Number(numPreguntas) || 5;

      // verificar curso
      const curso = await Course.findById(cursoId);
      if (!curso) {
        return res.status(404).json({ message: "El curso no existe." });
      }

      // ====== PROMPTS PARA OPENAI ======
      const systemPrompt = `
Eres un generador de cuestionarios tipo Kahoot para estudiantes.
Debes crear preguntas de opción múltiple a partir del texto dado.
Responde SOLO en JSON válido con este formato, SIN usar markdown ni \`\`\`:

{
  "preguntas": [
    {
      "enunciado": "string",
      "opciones": ["string","string","string","string"],
      "indiceCorrecta": 0
    }
  ]
}
      `.trim();

      const userPrompt = `
Texto base:
"""
${texto.slice(0, 5000)}
"""

Crea exactamente ${cantidad} preguntas de opción múltiple (4 opciones cada una).
Las preguntas deben ser claras y estar en español.

Devuélvelas SOLO como un JSON válido, sin texto extra, sin explicaciones
y SIN bloques de código markdown. NO escribas nada antes ni después del JSON.
      `.trim();

      const completion = await (openai.responses.create as any)({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw =
        (completion.output?.[0]?.content?.[0]?.text as string | undefined) ??
        "";

      if (!raw) {
        return res.status(500).json({
          message:
            "La IA no devolvió texto válido. Intenta nuevamente con otro documento.",
        });
      }

      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (_e) {
        console.error("JSON recibido de la IA (no se pudo parsear):", raw);
        return res.status(500).json({
          message:
            "No se pudo interpretar la respuesta de la IA como JSON. Revisa el texto de entrada o intenta nuevamente.",
        });
      }

      const preguntasIA = Array.isArray(parsed.preguntas)
        ? parsed.preguntas
        : [];

      if (preguntasIA.length === 0) {
        return res.status(500).json({
          message:
            "La IA no generó preguntas válidas. Intenta con otro texto o con menos contenido.",
        });
      }

      const preguntasNormalizadas = preguntasIA.map((p: any) => ({
        enunciado: String(p.enunciado ?? ""),
        opciones: Array.isArray(p.opciones)
          ? p.opciones.map((o: any) => String(o))
          : [],
        indiceCorrecta:
          typeof p.indiceCorrecta === "number"
            ? p.indiceCorrecta
            : Number(p.indiceCorrecta) || 0,
      }));

      const nuevoQuiz = await Quiz.create({
        titulo,
        curso: cursoId,
        preguntas: preguntasNormalizadas,
        estado: "Borrador", // IA también empieza como borrador
      });

      await Course.findByIdAndUpdate(cursoId, {
        $inc: { totalQuizzes: 1 },
      });

      return res.status(201).json(nuevoQuiz);
    } catch (error) {
      console.error("Error generando quiz con IA:", error);
      return res.status(500).json({
        message: "Error al generar el quiz con IA.",
      });
    }
  }
);

/* ============================================================
   3. LISTAR TODOS (ADMIN)
   ============================================================ */
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ creadoEn: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error("Error listando:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   4. LISTAR QUIZZES DE UN CURSO
   ============================================================ */
router.get("/curso/:cursoId", requireAuth, async (req, res) => {
  try {
    const { cursoId } = req.params;

    const quizzes = await Quiz.find({ curso: cursoId }).sort({
      creadoEn: -1,
    });

    res.json(quizzes);
  } catch (error) {
    console.error("Error listando por curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   5. ESTADO DEL QUIZ PARA EL ESTUDIANTE (evitar intentos dobles)
   ============================================================ */
// GET /api/quizzes/:quizId/estado-estudiante
router.get(
  "/:quizId/estado-estudiante",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;

      const progreso = await StudentQuizProgress.findOne({
        user: userId,
        quiz: quizId,
      });

      if (!progreso) {
        return res.json({ status: "pendiente", score: null });
      }

      return res.json({
        status: progreso.status,
        score: progreso.score ?? null,
      });
    } catch (error) {
      console.error("Error obteniendo estado de quiz estudiante:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener estado del quiz" });
    }
  }
);

/* ============================================================
   6. OBTENER QUIZ POR ID
   ============================================================ */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz no encontrado." });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error al obtener quiz:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   7. EDITAR QUIZ
   ============================================================ */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { titulo, preguntas } = req.body;

    const actualizado = await Quiz.findByIdAndUpdate(
      req.params.id,
      { titulo, preguntas },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: "Quiz no encontrado." });
    }

    res.json(actualizado);
  } catch (error) {
    console.error("Error actualizando quiz:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   8. PUBLICAR QUIZ
   ============================================================ */
router.patch("/:id/publicar", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz no encontrado" });
    }

    if (quiz.estado === "Publicado" && quiz.codigoAcceso) {
      return res.json(quiz);
    }

    if (!quiz.codigoAcceso) {
      const codigo = await generarCodigoQuiz();
      quiz.codigoAcceso = codigo;
    }

    quiz.estado = "Publicado";

    const actualizado = await quiz.save();
    res.json(actualizado);
  } catch (error) {
    console.error("Error al publicar:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   9. BUSCAR POR CÓDIGO (PARA ESTUDIANTES)
   ============================================================ */
router.get("/join/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;

    const quiz = await Quiz.findOne({ codigoAcceso: codigo });

    if (!quiz) {
      return res.status(404).json({
        message: "No se encontró un quiz con ese código.",
      });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error buscando código:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ============================================================
   10. SUBMIT QUIZ (ESTUDIANTE TERMINA)
   ============================================================ */
router.post("/:quizId/submit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.id;
    const { courseId, score } = req.body;

    if (!courseId || score == null) {
      return res
        .status(400)
        .json({ message: "courseId y score son obligatorios" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz no encontrado" });
    }

    await StudentQuizProgress.findOneAndUpdate(
      { user: userId, quiz: quizId, course: courseId },
      {
        status: "completado",
        score,
        finishedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({ message: "Quiz completado correctamente", score });
  } catch (error) {
    console.error("Error al enviar quiz:", error);
    return res.status(500).json({ message: "Error al enviar el quiz" });
  }
});

/* ============================================================
   11. ELIMINAR QUIZ
   ============================================================ */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz no encontrado." });
    }

    const cursoId = quiz.curso;

    await quiz.deleteOne();

    if (cursoId) {
      await Course.findByIdAndUpdate(cursoId, {
        $inc: { totalQuizzes: -1 },
      });
    }

    res.json({ message: "Quiz eliminado correctamente." });
  } catch (error) {
    console.error("Error eliminando quiz:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
