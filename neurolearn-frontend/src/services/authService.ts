// src/services/authService.ts
import api from "./api";

/* ---------------------------------------------
 * Tipos reutilizables
 * --------------------------------------------- */
export type RolUsuario = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

export interface UsuarioBase {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

/* ---------------------------------------------
 * Respuestas del backend
 * --------------------------------------------- */
export interface LoginResponse {
  message: string;
  token: string;
  usuario: UsuarioBase;
}

export interface RegisterResponse {
  message: string;
  usuario: UsuarioBase;
}

/* ---------------------------------------------
 * 👉 LOGIN
 * --------------------------------------------- */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

/* ---------------------------------------------
 * 👉 REGISTER (solo crea ESTUDIANTES)
 * --------------------------------------------- */
export const registerUser = async (
  nombre: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await api.post("/auth/register", {
    nombre,
    email,
    password,
    rol: "ESTUDIANTE", // 🔒 siempre estudiante desde el frontend
  });

  return response.data;
};
