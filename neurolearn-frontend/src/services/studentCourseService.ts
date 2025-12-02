// src/services/studentCourseService.ts 
import api from "./api";
import type { CursoEstudiante } from "./courseService";
import type { Quiz } from "./quizService";

/** Versión extendida del quiz con info del estudiante */
export interface QuizEstudiante extends Quiz {
  estadoEstudiante?: "pendiente" | "completado";
  puntaje?: number | null;
}

/** Respuesta del endpoint de detalle de curso para estudiante */
export interface CursoEstudianteDetalleResponse {
  curso: CursoEstudiante;
  quizzes: QuizEstudiante[];
}

/**
 * Listar cursos del estudiante (inscritos + disponibles)
 * GET /api/cursos/estudiante/mis-cursos
 */
export const getCursosEstudiante = async (): Promise<CursoEstudiante[]> => {
  const res = await api.get("/cursos/estudiante/mis-cursos");
  return res.data;
};

/**
 * Detalle de un curso al que el estudiante está inscrito
 * GET /api/cursos-estudiante/curso/:id
 */
export const getCursoEstudianteDetalle = async (
  id: string
): Promise<CursoEstudianteDetalleResponse | CursoEstudiante> => {
  const res = await api.get(`/cursos-estudiante/curso/${id}`);
  return res.data;
};

/**
 * Unirse a un curso como estudiante
 * POST /api/cursos/:id/unirse
 */
export const unirseCurso = async (
  cursoId: string
): Promise<CursoEstudiante> => {
  const res = await api.post(`/cursos/${cursoId}/unirse`);

  // El backend devuelve { message, curso }
  return res.data.curso ?? res.data;
};

/* ============================================================
   🔥 NUEVO: SALIR DE UN CURSO
   POST /api/cursos/:cursoId/salir
   ============================================================ */

export interface SalirCursoResponse {
  message: string;
}

export const salirCurso = async (
  cursoId: string
): Promise<SalirCursoResponse> => {
  const res = await api.post(`/cursos/${cursoId}/salir`);
  return res.data;
};
