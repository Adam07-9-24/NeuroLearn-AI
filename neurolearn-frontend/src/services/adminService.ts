import api from "./api";

/* ---------- Tipos ---------- */
export interface DashboardStats {
  totalUsuarios: number;
  activos: number;
  bloqueados: number;
  cursosActivos: number;
  quizzesCreados: number;
  roles: {
    admins: number;
    docentes: number;
    estudiantes: number;
  };
}

export type RolUsuario = "ADMIN" | "DOCENTE" | "ESTUDIANTE";
export type EstadoUsuario = "Activo" | "Bloqueado";

export interface AdminUsuario {
  _id: string; // viene así de Mongo
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  fechaRegistro?: string;
}

/* ---------- Dashboard ---------- */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/admin/stats");
  return res.data;
};

/* ---------- Gestión de usuarios ---------- */

// Lista todos los usuarios
export const getUsuarios = async (): Promise<AdminUsuario[]> => {
  const res = await api.get("/users");
  return res.data;
};

// Cambia estado (Activo / Bloqueado)
export const cambiarEstadoUsuario = async (
  id: string,
  nuevoEstado: EstadoUsuario
): Promise<AdminUsuario> => {
  const res = await api.patch(`/users/${id}/estado`, {
    estado: nuevoEstado,
  });
  return res.data.usuario;
};

// 🔵 Cambia rol (ADMIN / DOCENTE / ESTUDIANTE)
export const cambiarRolUsuario = async (
  id: string,
  nuevoRol: RolUsuario
): Promise<AdminUsuario> => {
  const res = await api.patch(`/users/${id}/rol`, {
    rol: nuevoRol,
  });
  return res.data.usuario;
};

// Elimina usuario
export const eliminarUsuario = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// Crea usuario desde el panel admin
export const crearUsuarioDesdeAdmin = async (data: {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}): Promise<AdminUsuario> => {
  const res = await api.post("/users", data);
  return res.data.usuario;
};
