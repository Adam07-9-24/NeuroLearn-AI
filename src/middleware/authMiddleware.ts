import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

interface JwtPayload {
  id: string;
  rol: "ADMIN" | "DOCENTE" | "ESTUDIANTE";
  nombre: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload; // <-- AHORA SE LLAMA user
}

// Middleware: Verificar que el usuario está logueado
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No se proporcionó el token de autenticación" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded; // <-- GUARDAMOS user con id, rol, nombre
    next();
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
};

// Middleware: Solo ADMIN
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.rol !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Acceso solo para administradores" });
  }

  next();
};

// ✅ NUEVO: Middleware Solo DOCENTE
export const requireDocente = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.rol !== "DOCENTE") {
    return res
      .status(403)
      .json({ message: "Acceso solo para docentes" });
  }

  next();
};
