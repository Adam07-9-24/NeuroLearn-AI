import { useEffect, useState, useMemo } from "react";
import {
  getUsuarios,
  cambiarEstadoUsuario,
  eliminarUsuario,
  cambiarRolUsuario,
  crearUsuarioDesdeAdmin,
  type AdminUsuario,
  type RolUsuario,
} from "../../services/adminService";
import AdminTopBar from "../../components/admin/AdminTopBar";

type FiltroRol = "TODOS" | "ADMIN" | "DOCENTE" | "ESTUDIANTE";

const UsuariosAdminPage = () => {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("TODOS");

  // 👉 modal cambiar rol
  const [mostrandoModalRol, setMostrandoModalRol] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<AdminUsuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] =
    useState<RolUsuario>("ESTUDIANTE");
  const [guardandoRol, setGuardandoRol] = useState(false);

  // 👉 modal nuevo usuario
  const [mostrandoModalNuevo, setMostrandoModalNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>("ESTUDIANTE");
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);

  // 🔵 cargar usuarios
  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null);
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de usuarios.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleToggleEstado = async (u: AdminUsuario) => {
    try {
      const nuevo = u.estado === "Activo" ? "Bloqueado" : "Activo";
      const actualizado = await cambiarEstadoUsuario(u._id, nuevo);
      setUsuarios((prev) =>
        prev.map((x) => (x._id === u._id ? actualizado : x))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const handleEliminar = async (u: AdminUsuario) => {
    if (!confirm(`¿Eliminar al usuario ${u.nombre}?`)) return;
    try {
      await eliminarUsuario(u._id);
      setUsuarios((prev) => prev.filter((x) => x._id !== u._id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el usuario.");
    }
  };

  // 👉 abrir/cerrar modal rol
  const abrirModalRol = (u: AdminUsuario) => {
    setUsuarioSeleccionado(u);
    setRolSeleccionado(u.rol);
    setMostrandoModalRol(true);
  };

  const cerrarModalRol = () => {
    setMostrandoModalRol(false);
    setUsuarioSeleccionado(null);
  };

  const handleGuardarRol = async () => {
    if (!usuarioSeleccionado) return;
    try {
      setGuardandoRol(true);
      const actualizado = await cambiarRolUsuario(
        usuarioSeleccionado._id,
        rolSeleccionado
      );
      setUsuarios((prev) =>
        prev.map((x) => (x._id === actualizado._id ? actualizado : x))
      );
      cerrarModalRol();
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el rol.");
    } finally {
      setGuardandoRol(false);
    }
  };

  // 👉 abrir/cerrar modal NUEVO USUARIO
  const abrirModalNuevo = () => {
    setNuevoNombre("");
    setNuevoEmail("");
    setNuevoPassword("");
    setNuevoRol("ESTUDIANTE");
    setErrorNuevo(null);
    setMostrandoModalNuevo(true);
  };

  const cerrarModalNuevo = () => {
    setMostrandoModalNuevo(false);
  };

  const handleCrearUsuario = async () => {
    if (!nuevoNombre || !nuevoEmail || !nuevoPassword) {
      setErrorNuevo("Todos los campos son obligatorios");
      return;
    }

    try {
      setCreandoUsuario(true);
      setErrorNuevo(null);

      const creado = await crearUsuarioDesdeAdmin({
        nombre: nuevoNombre,
        email: nuevoEmail,
        password: nuevoPassword,
        rol: nuevoRol,
      });

      setUsuarios((prev) => [creado, ...prev]);
      cerrarModalNuevo();
    } catch (err: unknown) {
      console.error(err);

      let mensaje = "No se pudo crear el usuario. Inténtalo de nuevo.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const posibleError = err as {
          response?: { data?: { message?: string } };
        };
        const msgBackend = posibleError.response?.data?.message;
        if (msgBackend) {
          mensaje = msgBackend;
        }
      }

      setErrorNuevo(mensaje);
    } finally {
      setCreandoUsuario(false);
    }
  };

  // 🔍 filtrado
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((u) => {
      const coincideRol =
        filtroRol === "TODOS" ? true : u.rol === filtroRol;

      const coincideTexto =
        texto.length === 0
          ? true
          : u.nombre.toLowerCase().includes(texto) ||
            u.email.toLowerCase().includes(texto);

      return coincideRol && coincideTexto;
    });
  }, [usuarios, busqueda, filtroRol]);

  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#b91c1c",
        }}
      >
        {error}
      </div>
    );
  }

  // Helpers visuales
  const getRolChipStyle = (rol: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
    };

    switch (rol) {
      case "ADMIN":
        return {
          ...base,
          backgroundColor: "rgba(59,130,246,0.16)",
          color: "#1d4ed8",
        };
      case "DOCENTE":
        return {
          ...base,
          backgroundColor: "rgba(129,140,248,0.18)",
          color: "#4f46e5",
        };
      default:
        return {
          ...base,
          backgroundColor: "rgba(52,211,153,0.16)",
          color: "#059669",
        };
    }
  };

  const filtros: { label: string; value: FiltroRol }[] = [
    { label: "Todos", value: "TODOS" },
    { label: "Admins", value: "ADMIN" },
    { label: "Docentes", value: "DOCENTE" },
    { label: "Estudiantes", value: "ESTUDIANTE" },
  ];

  // estilos modal
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 70,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: "18px 20px 16px",
    width: "100%",
    maxWidth: 420,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 50px rgba(15,23,42,0.35)",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: 6,
    color: "#0f172a",
  };

  const modalTextStyle: React.CSSProperties = {
    fontSize: "0.88rem",
    color: "#4b5563",
    marginBottom: 12,
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 14,
  };

  const modalButtonsRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#4b5563",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Barra superior del admin */}
      <AdminTopBar />

      {/* Contenido principal */}
      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 32px",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "4px",
                color: "#0f172a",
              }}
            >
              Gestión de Usuarios
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
              Administra todos los usuarios de la plataforma.
            </p>
          </div>

          {/* BOTÓN NUEVO USUARIO */}
          <button
            onClick={abrirModalNuevo}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
              border: "none",
              borderRadius: "999px",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(109,40,217,0.25)",
              transition: "0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            🧑‍💼 Nuevo Usuario
          </button>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            padding: "16px 18px 20px",
          }}
        >
          {/* Barra superior: buscador + filtros */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
              justifyContent: "space-between",
            }}
          >
            {/* Buscador */}
            <div style={{ flex: "1 1 260px", maxWidth: "520px" }}>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Filtros de rol */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              {filtros.map((f) => {
                const activo = filtroRol === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFiltroRol(f.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      border: activo ? "none" : "1px solid #e5e7eb",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      backgroundColor: activo ? "#111827" : "#ffffff",
                      color: activo ? "#f9fafb" : "#4b5563",
                      fontWeight: activo ? 600 : 500,
                      transition: "0.2s",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABLA */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "#6b7280" }}>
                  <th style={{ padding: "10px 8px" }}>Usuario</th>
                  <th style={{ padding: "10px 8px" }}>Email</th>
                  <th style={{ padding: "10px 8px" }}>Rol</th>
                  <th style={{ padding: "10px 8px" }}>Estado</th>
                  <th style={{ padding: "10px 8px" }}>Fecha registro</th>
                  <th style={{ padding: "10px 8px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr
                    key={u._id}
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      color: "#111827",
                    }}
                  >
                    {/* Usuario + avatar */}
                    <td style={{ padding: "10px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "999px",
                            background:
                              "linear-gradient(135deg,#6366f1,#ec4899)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.nombre}</span>
                      </div>
                    </td>

                    <td style={{ padding: "10px 8px" }}>{u.email}</td>

                    <td style={{ padding: "10px 8px" }}>
                      <span style={getRolChipStyle(u.rol)}>{u.rol}</span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: "10px 8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          backgroundColor:
                            u.estado === "Activo"
                              ? "rgba(22,163,74,0.12)"
                              : "rgba(248,113,113,0.12)",
                          color:
                            u.estado === "Activo" ? "#15803d" : "#b91c1c",
                          fontWeight: 500,
                        }}
                      >
                        {u.estado}
                      </span>
                    </td>

                    {/* Fecha registro */}
                    <td style={{ padding: "10px 8px", color: "#4b5563" }}>
                      {u.fechaRegistro
                        ? new Date(u.fechaRegistro).toLocaleDateString(
                            "es-PE"
                          )
                        : "-"}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: "10px 8px" }}>
                      <button
                        onClick={() => handleToggleEstado(u)}
                        style={{
                          marginRight: "8px",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          border: "none",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor:
                            u.estado === "Activo" ? "#fee2e2" : "#dcfce7",
                          color:
                            u.estado === "Activo" ? "#b91c1c" : "#15803d",
                          fontWeight: 500,
                        }}
                      >
                        {u.estado === "Activo" ? "Bloquear" : "Activar"}
                      </button>

                      <button
                        onClick={() => abrirModalRol(u)}
                        style={{
                          marginRight: "8px",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          border: "none",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor: "#e0e7ff",
                          color: "#3730a3",
                          fontWeight: 500,
                        }}
                      >
                        Cambiar rol
                      </button>

                      <button
                        onClick={() => handleEliminar(u)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "999px",
                          border: "none",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontWeight: 500,
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "16px 8px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL CAMBIAR ROL */}
      {mostrandoModalRol && usuarioSeleccionado && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={modalTitleStyle}>Cambiar rol</h2>
            <p style={modalTextStyle}>
              Selecciona el nuevo rol para{" "}
              <strong>{usuarioSeleccionado.nombre}</strong>.
            </p>

            <select
              value={rolSeleccionado}
              onChange={(e) =>
                setRolSeleccionado(e.target.value as RolUsuario)
              }
              style={selectStyle}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="DOCENTE">DOCENTE</option>
              <option value="ESTUDIANTE">ESTUDIANTE</option>
            </select>

            <div style={modalButtonsRow}>
              <button
                onClick={cerrarModalRol}
                disabled={guardandoRol}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#4b5563",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarRol}
                disabled={guardandoRol}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontWeight: 600,
                  opacity: guardandoRol ? 0.7 : 1,
                }}
              >
                {guardandoRol ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO USUARIO */}
      {mostrandoModalNuevo && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={modalTitleStyle}>Nuevo usuario</h2>
            <p style={modalTextStyle}>
              Completa los datos para crear un nuevo usuario en la
              plataforma.
            </p>

            {errorNuevo && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#b91c1c",
                  marginBottom: 8,
                }}
              >
                {errorNuevo}
              </p>
            )}

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={nuevoPassword}
                onChange={(e) => setNuevoPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Rol</label>
              <select
                value={nuevoRol}
                onChange={(e) =>
                  setNuevoRol(e.target.value as RolUsuario)
                }
                style={selectStyle}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="ESTUDIANTE">ESTUDIANTE</option>
              </select>
            </div>

            <div style={modalButtonsRow}>
              <button
                onClick={cerrarModalNuevo}
                disabled={creandoUsuario}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#4b5563",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearUsuario}
                disabled={creandoUsuario}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontWeight: 600,
                  opacity: creandoUsuario ? 0.7 : 1,
                }}
              >
                {creandoUsuario ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdminPage;
