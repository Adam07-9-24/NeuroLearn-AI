// src/services/docenteCourseService.ts
import api from "./api";
import type { Curso, EstadoCurso } from "./courseService";

/** Lista los cursos del docente logueado */
export const getCursosDocente = async (): Promise<Curso[]> => {
  const res = await api.get("/docente/cursos");
  return res.data;
};

/** Obtiene un curso del docente por ID */
export const getCursoDocenteById = async (id: string): Promise<Curso> => {
  const res = await api.get(`/docente/cursos/${id}`);
  return res.data;
};

/** Crear curso (docente) */
export const crearCursoDocente = async (data: {
  nombre: string;
  descripcion?: string;
}): Promise<Curso> => {
  const res = await api.post("/docente/cursos", data);
  return res.data;
};

/** Editar curso del docente */
export const actualizarCursoDocente = async (
  id: string,
  data: Partial<Pick<Curso, "nombre" | "descripcion" | "estado">>
): Promise<Curso> => {
  const res = await api.put(`/docente/cursos/${id}`, data);
  return res.data;
};

/** Cambiar estado (Activo / Inactivo) */
export const cambiarEstadoCursoDocente = async (
  id: string,
  estado: EstadoCurso
): Promise<Curso> => {
  const res = await api.patch(`/docente/cursos/${id}/estado`, { estado });
  return res.data;
};

/** Eliminar curso del docente (si no tiene estudiantes) */
export const eliminarCursoDocente = async (id: string): Promise<void> => {
  await api.delete(`/docente/cursos/${id}`);
};
