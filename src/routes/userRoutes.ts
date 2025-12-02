import { Router } from "express";
import User from "../models/User";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/authMiddleware";
import bcrypt from "bcrypt";

const router = Router();

/**
 * GET /api/users
 * Lista todos los usuarios (solo ADMIN)
 */
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const usuarios = await User.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * ⭐ NUEVO – Endpoint para el Dashboard del Admin
 * GET /api/users/dashboard/stats
 */
router.get("/dashboard/stats", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const activos = await User.countDocuments({ estado: "Activo" });
    const bloqueados = await User.countDocuments({ estado: "Bloqueado" });

    const admins = await User.countDocuments({ rol: "ADMIN" });
    const docentes = await User.countDocuments({ rol: "DOCENTE" });
    const estudiantes = await User.countDocuments({ rol: "ESTUDIANTE" });

    res.json({
      totalUsuarios,
      activos,
      bloqueados,
      roles: { admins, docentes, estudiantes }
    });

  } catch (error) {
    console.error("Error obteniendo stats:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


router.patch("/:id/estado", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["Activo", "Bloqueado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido. Use 'Activo' o 'Bloqueado'" });
    }

    const usuario = await User.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).select("-password");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Estado actualizado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


router.delete("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id).select("-password");
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (usuario.rol === "ADMIN") {
      return res.status(400).json({
        message: "No puedes eliminar usuarios con rol ADMIN"
      });
    }

    if (req.user && req.user.id === id) {
      return res.status(400).json({
        message: "No puedes eliminar tu propio usuario"
      });
    }

    await usuario.deleteOne();

    res.json({
      message: "Usuario eliminado correctamente",
      usuario
    });

  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * PATCH /api/users/:id/rol
 * Cambia el rol de un usuario (ADMIN, DOCENTE, ESTUDIANTE)
 */
router.patch("/:id/rol", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!["ADMIN", "DOCENTE", "ESTUDIANTE"].includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const usuario = await User.findByIdAndUpdate(
      id,
      { rol },
      { new: true }
    ).select("-password");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({
      message: "Rol actualizado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("Error actualizando rol:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});


/**
 * GET /api/users/:id
 * Ver detalle de un usuario
 */
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * POST /api/users
 * Crear usuario desde admin
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await User.create({
      nombre,
      email,
      password: hashed,
      rol: rol || "ESTUDIANTE",
      estado: "Activo",
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol: nuevo.rol,
        estado: nuevo.estado
      }
    });

  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
