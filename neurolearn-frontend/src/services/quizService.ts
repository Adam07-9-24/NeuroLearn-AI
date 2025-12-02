// src/services/quizService.ts
import api from "./api";

export type QuizEstado = "Borrador" | "Publicado";

export interface QuizQuestion {
  enunciado: string;
  opciones: string[];
  indiceCorrecta: number;
  tiempoSegundos?: number;
  puntos?: number;
}

export interface Quiz {
  _id: string;
  titulo: string;
  curso?: string;
  preguntas: QuizQuestion[];
  estado: QuizEstado;
  creadoEn: string;
  codigoAcceso?: string; // 👈 NUEVO
}

/** Publicar quiz (genera código si no tiene) */
export const publicarQuiz = async (id: string): Promise<Quiz> => {
  const { data } = await api.patch(`/quizzes/${id}/publicar`);
  return data;
};

/** Lista quizzes por curso */
export const getQuizzesByCurso = async (cursoId: string): Promise<Quiz[]> => {
  const res = await api.get(`/quizzes/curso/${cursoId}`);
  return res.data;
};

/** Obtener un quiz por ID */
export const getQuizById = async (id: string): Promise<Quiz> => {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
};

/** Crear quiz vacío (sin preguntas por ahora, modo manual) */
export const crearQuiz = async (data: {
  titulo: string;
  curso: string;
}): Promise<Quiz> => {
  const res = await api.post("/quizzes", {
    ...data,
    preguntas: [], // quiz en blanco
  });
  return res.data;
};

/** Actualizar quiz (título / estado / preguntas) */
export const actualizarQuiz = async (
  id: string,
  data: Partial<Pick<Quiz, "titulo" | "estado" | "preguntas">>
): Promise<Quiz> => {
  const res = await api.put(`/quizzes/${id}`, data);
  return res.data;
};

/** Eliminar quiz */
export const eliminarQuiz = async (id: string): Promise<void> => {
  await api.delete(`/quizzes/${id}`);
};

/* ================================================
   IA: Generar quiz desde texto (gpt-4.1-mini)
   ================================================ */

export interface GenerarQuizIAInput {
  titulo: string;
  cursoId: string;
  texto: string;
  numPreguntas?: number;
}

export const generarQuizDesdeTexto = async (
  payload: GenerarQuizIAInput
): Promise<Quiz> => {
  const res = await api.post("/quizzes/generar-desde-texto", payload);
  return res.data;
};

/** Obtener quiz por código de acceso */
export const getQuizByCodigo = async (codigo: string): Promise<Quiz> => {
  const res = await api.get(`/quizzes/join/${codigo}`);
  return res.data;
};

/* ================================================
   Estado del quiz para el estudiante
   (para evitar que lo resuelva 2 veces)
   ================================================ */

export interface EstadoQuizEstudiante {
  status: "pendiente" | "completado";
  score: number | null;
}

/** Saber si el estudiante ya completó ese quiz */
export const getEstadoQuizEstudiante = async (
  quizId: string
): Promise<EstadoQuizEstudiante> => {
  const res = await api.get(`/quizzes/${quizId}/estado-estudiante`);
  return res.data as EstadoQuizEstudiante;
};

/* ================================================
   Enviar quiz (guardar progreso del estudiante)
   ================================================ */

export interface SubmitQuizPayload {
  courseId: string;
  score: number;
}

/** Marcar un quiz como completado por el estudiante */
export const submitQuiz = async (
  quizId: string,
  payload: SubmitQuizPayload
): Promise<{ message: string; score: number }> => {
  const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
  return data;
};
