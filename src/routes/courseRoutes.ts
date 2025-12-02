// src/routes/courseRoutes.ts
import { Router } from "express";
import Course from "../models/Course";
import {
  requireAuth,
  requireAdmin,
  type AuthRequest,
} from "../middleware/authMiddleware";

const router = Router();

/* ============================================================
   ESTUDIANTE: LISTAR CURSOS (MIS CURSOS / DISPONIBLES)
   GET /api/cursos/estudiante/mis-cursos
   ============================================================ */
router.get(
  "/estudiante/mis-cursos",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;

      // Solo cursos activos
      const cursosDB = await Course.find({ estado: "Activo" }).sort({
        nombre: 1,
      });

      // Marcamos si el usuario ya está inscrito en cada curso
      const cursosConFlag = cursosDB.map((curso) => {
        const yaInscrito = curso.estudiantes.some(
          (est) => est.toString() === String(userId)
        );
        const plain = curso.toObject();
        return { ...plain, yaInscrito };
      });

      res.json(cursosConFlag);
    } catch (error) {
      console.error("Error listando cursos para estudiante:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

/* ============================================================
   ESTUDIANTE: DETALLE DE UN CURSO AL QUE ESTÁ INSCRITO
   GET /api/cursos/estudiante/curso/:id
   (versión simple, sin quizzes; la versión con quizzes
    la tienes en studentCourseRoutes.ts -> /api/cursos-estudiante/curso/:id)
   ============================================================ */
router.get(
  "/estudiante/curso/:id",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const curso = await Course.findById(id);
      if (!curso) {
        return res.status(404).json({ message: "Curso no encontrado." });
      }

      const yaInscrito = curso.estudiantes.some(
        (est) => est.toString() === String(userId)
      );

      if (!yaInscrito) {
        return res
          .status(403)
          .json({ message: "No estás inscrito en este curso." });
      }

      const plain = curso.toObject();
      return res.json({ ...plain, yaInscrito: true });
    } catch (error) {
      console.error("Error obteniendo curso para estudiante:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

/* ================== CREAR CURSO (ADMIN) ================== */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      estado,
      docenteNombre,
      totalEstudiantes,
      totalQuizzes,
    } = req.body;

    const nuevo = await Course.create({
      nombre,
      descripcion,
      estado: estado || "Activo",
      docenteNombre: docenteNombre || "Sin asignar",
      totalEstudiantes: totalEstudiantes ?? 0,
      totalQuizzes: totalQuizzes ?? 0,
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error creando curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== LISTAR CURSOS (ADMIN) ================== */
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const cursos = await Course.find().sort({ creadoEn: -1 });
    res.json(cursos);
  } catch (error) {
    console.error("Error listando cursos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== OBTENER CURSO POR ID (ADMIN) ================== */
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const curso = await Course.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    res.json(curso);
  } catch (error) {
    console.error("Error obteniendo curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* =====================================
   UNIRSE A UN CURSO (ESTUDIANTE)
   POST /api/cursos/:id/unirse
   ===================================== */
router.post("/:id/unirse", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const curso = await Course.findById(id);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    if (curso.estado !== "Activo") {
      return res
        .status(400)
        .json({ message: "Este curso no está disponible actualmente." });
    }

    const yaInscrito = curso.estudiantes.some(
      (est) => est.toString() === String(userId)
    );

    if (yaInscrito) {
      return res
        .status(400)
        .json({ message: "Ya estás inscrito en este curso." });
    }

    curso.estudiantes.push(userId as any);
    curso.totalEstudiantes = curso.estudiantes.length;

    await curso.save();

    const plain = curso.toObject();

    return res.json({
      message: "Te uniste correctamente al curso.",
      curso: { ...plain, yaInscrito: true },
    });
  } catch (error) {
    console.error("Error uniendo estudiante:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* =====================================
   SALIR DE UN CURSO (ESTUDIANTE)
   POST /api/cursos/:id/salir
   ===================================== */
router.post("/:id/salir", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const curso = await Course.findById(id);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const yaInscrito = curso.estudiantes.some(
      (est) => est.toString() === String(userId)
    );

    if (!yaInscrito) {
      return res
        .status(400)
        .json({ message: "No estabas inscrito en este curso." });
    }

    // Quitamos al estudiante del array
    curso.estudiantes = curso.estudiantes.filter(
      (est) => est.toString() !== String(userId)
    );

    // Actualizamos contador
    curso.totalEstudiantes = curso.estudiantes.length;

    await curso.save();

    const plain = curso.toObject();

    return res.json({
      message: "Has salido del curso correctamente.",
      curso: { ...plain, yaInscrito: false },
    });
  } catch (error) {
    console.error("Error al salir del curso:", error);
    return res
      .status(500)
      .json({ message: "Error al intentar salir del curso." });
  }
});

/* ================== EDITAR CURSO (PUT) ================== */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      estado,
      docenteNombre,
      totalEstudiantes,
      totalQuizzes,
    } = req.body;

    const updates: any = {};

    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (estado !== undefined) updates.estado = estado;
    if (docenteNombre !== undefined) updates.docenteNombre = docenteNombre;
    if (totalEstudiantes !== undefined)
      updates.totalEstudiantes = totalEstudiantes;
    if (totalQuizzes !== undefined) updates.totalQuizzes = totalQuizzes;

    const cursoActualizado = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!cursoActualizado) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    res.json(cursoActualizado);
  } catch (error) {
    console.error("Error actualizando curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== ELIMINAR / CAMBIAR ESTADO ================== */

// Eliminar curso (solo si no tiene estudiantes)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const curso = await Course.findById(id);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    if ((curso.totalEstudiantes ?? 0) > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar el curso porque tiene estudiantes inscritos.",
      });
    }

    await curso.deleteOne();

    return res.json({ message: "Curso eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Cambiar estado (Activo / Inactivo)
router.patch("/:id/estado", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const curso = await Course.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    res.json(curso);
  } catch (error) {
    console.error("Error cambiando estado del curso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
