// src/services/courseService.ts
import api from "./api";

export type EstadoCurso = "Activo" | "Inactivo";

export interface Curso {
  _id: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoCurso;
  docenteNombre?: string;
  totalEstudiantes?: number;
  totalQuizzes?: number;
  creadoEn?: string;
}

// Versión de curso que usa el estudiante (tiene el flag yaInscrito)
export interface CursoEstudiante extends Curso {
  yaInscrito?: boolean;
}

// ================= ADMIN =================

// Listar cursos (admin)
export const getCursos = async (): Promise<Curso[]> => {
  const res = await api.get("/cursos");
  return res.data;
};

// Obtener curso por id (admin)
export const getCursoById = async (id: string): Promise<Curso> => {
  const res = await api.get(`/cursos/${id}`);
  return res.data;
};

// Editar curso (admin)
export const updateCurso = async (
  id: string,
  data: Partial<Omit<Curso, "_id">>
): Promise<Curso> => {
  const res = await api.put(`/cursos/${id}`, data);
  return res.data;
};

// Eliminar curso (admin)
export const deleteCurso = async (id: string): Promise<void> => {
  await api.delete(`/cursos/${id}`);
};

// Cambiar estado (admin)
export const cambiarEstadoCurso = async (
  id: string,
  estado: EstadoCurso
): Promise<Curso> => {
  const res = await api.patch(`/cursos/${id}/estado`, { estado });
  return res.data;
};
