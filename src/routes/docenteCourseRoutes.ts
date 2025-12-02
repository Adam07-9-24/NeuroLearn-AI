// src/routes/docenteCourseRoutes.ts
import { Router } from "express";
import type { Response } from "express";
import Course from "../models/Course";
import {
  requireAuth,
  requireDocente,
  type AuthRequest,
} from "../middleware/authMiddleware";

const router = Router();


router.post("/", requireAuth, requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    const docenteNombre = req.user?.nombre || "Docente sin nombre";

    if (!nombre) {
      return res
        .status(400)
        .json({ message: "El nombre del curso es obligatorio." });
    }

    const nuevo = await Course.create({
      nombre,
      descripcion,
      estado: "Activo", // siempre inicia activo
      docenteNombre,    // 👈 se toma del usuario logueado
      totalEstudiantes: 0,
      totalQuizzes: 0,
    });

    return res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error creando curso (docente):", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== LISTAR CURSOS DEL DOCENTE ================== */
// GET /api/docente/cursos
router.get("/", requireAuth, requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const docenteNombre = req.user?.nombre;

    const cursos = await Course.find({ docenteNombre }).sort({ creadoEn: -1 });

    return res.json(cursos);
  } catch (error) {
    console.error("Error listando cursos del docente:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== OBTENER UN CURSO DEL DOCENTE ================== */
// GET /api/docente/cursos/:id
router.get("/:id", requireAuth, requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const docenteNombre = req.user?.nombre;
    const { id } = req.params;

    const curso = await Course.findOne({ _id: id, docenteNombre });

    if (!curso) {
      return res
        .status(404)
        .json({ message: "Curso no encontrado o no te pertenece." });
    }

    return res.json(curso);
  } catch (error) {
    console.error("Error obteniendo curso del docente:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== EDITAR CURSO (DOCENTE) ================== */
// PUT /api/docente/cursos/:id
router.put("/:id", requireAuth, requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const docenteNombre = req.user?.nombre;
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    const updates: any = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (estado !== undefined) updates.estado = estado;

    const cursoActualizado = await Course.findOneAndUpdate(
      { _id: id, docenteNombre },
      updates,
      { new: true }
    );

    if (!cursoActualizado) {
      return res
        .status(404)
        .json({ message: "Curso no encontrado o no te pertenece." });
    }

    return res.json(cursoActualizado);
  } catch (error) {
    console.error("Error actualizando curso (docente):", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* ================== CAMBIAR ESTADO (ACTIVO / INACTIVO) ================== */
// PATCH /api/docente/cursos/:id/estado
router.patch(
  "/:id/estado",
  requireAuth,
  requireDocente,
  async (req: AuthRequest, res: Response) => {
    try {
      const docenteNombre = req.user?.nombre;
      const { id } = req.params;
      const { estado } = req.body;

      const curso = await Course.findOneAndUpdate(
        { _id: id, docenteNombre },
        { estado },
        { new: true }
      );

      if (!curso) {
        return res
          .status(404)
          .json({ message: "Curso no encontrado o no te pertenece." });
      }

      return res.json(curso);
    } catch (error) {
      console.error("Error cambiando estado del curso (docente):", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

/* ================== ELIMINAR CURSO (DOCENTE) ================== */
// DELETE /api/docente/cursos/:id
// SOLO si totalEstudiantes === 0
router.delete(
  "/:id",
  requireAuth,
  requireDocente,
  async (req: AuthRequest, res: Response) => {
    try {
      const docenteNombre = req.user?.nombre;
      const { id } = req.params;

      const curso = await Course.findOne({ _id: id, docenteNombre });

      if (!curso) {
        return res
          .status(404)
          .json({ message: "Curso no encontrado o no te pertenece." });
      }

      if ((curso.totalEstudiantes ?? 0) > 0) {
        return res.status(400).json({
          message:
            "No puedes eliminar este curso porque ya tiene estudiantes inscritos.",
        });
      }

      await curso.deleteOne();

      return res.json({ message: "Curso eliminado correctamente." });
    } catch (error) {
      console.error("Error eliminando curso (docente):", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

export default router;
