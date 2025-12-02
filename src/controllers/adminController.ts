import { Request, Response } from "express";
import User from "../models/User";
import Course from "../models/Course";
import Quiz from "../models/Quiz";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const activos = await User.countDocuments({ estado: "Activo" });
    const bloqueados = await User.countDocuments({ estado: "Bloqueado" });

    const admins = await User.countDocuments({ rol: "ADMIN" });
    const docentes = await User.countDocuments({ rol: "DOCENTE" });
    const estudiantes = await User.countDocuments({ rol: "ESTUDIANTE" });

        // ✅ Ahora son datos reales:
    const cursosActivos = await Course.countDocuments({ estado: "Activo" });
    const quizzesCreados = await Quiz.countDocuments();

   res.json({
      totalUsuarios,
      activos,
      bloqueados,
      cursosActivos,
      quizzesCreados,
      roles: {
        admins,
        docentes,
        estudiantes,
      },
    });
  } catch (error) {
    console.error("Error obteniendo stats:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

