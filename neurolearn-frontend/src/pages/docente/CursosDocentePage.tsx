import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Curso, EstadoCurso } from "../../services/courseService";
import {
  getCursosDocente,
  crearCursoDocente,
  actualizarCursoDocente,
  cambiarEstadoCursoDocente,
  eliminarCursoDocente,
} from "../../services/docenteCourseService";
import { useAuth } from "../../context/useAuth";

const CursosDocentePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // 👉 Crear curso
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [creando, setCreando] = useState(false);

  // 👉 Editar curso
  const [mostrandoModalEditar, setMostrandoModalEditar] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [estadoEdit, setEstadoEdit] = useState<EstadoCurso>("Activo");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // ================== LOGOUT ==================
  const handleLogout = () => {
    logout(); // limpia contexto / token
    navigate("/login");
  };

  // Cargar cursos del docente
  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null);
        const data = await getCursosDocente();
        setCursos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus cursos.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const cursosFiltrados = useMemo(() => {
    const text = busqueda.trim().toLowerCase();
    if (!text) return cursos;

    return cursos.filter((c) => {
      const desc = c.descripcion ?? "";
      return (
        c.nombre.toLowerCase().includes(text) ||
        desc.toLowerCase().includes(text)
      );
    });
  }, [cursos, busqueda]);

  // ================== CREAR CURSO ==================
  const handleCrearCurso = async () => {
    if (!nuevoNombre.trim()) {
      alert("El nombre del curso es obligatorio.");
      return;
    }

    try {
      setCreando(true);
      const creado = await crearCursoDocente({
        nombre: nuevoNombre.trim(),
        descripcion: nuevaDescripcion.trim() || undefined,
      });

      setCursos((prev) => [creado, ...prev]);
      setNuevoNombre("");
      setNuevaDescripcion("");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el curso.");
    } finally {
      setCreando(false);
    }
  };

  // ================== EDITAR CURSO ==================
  const abrirModalEditar = (curso: Curso) => {
    setCursoEditando(curso);
    setNombreEdit(curso.nombre);
    setDescripcionEdit(curso.descripcion ?? "");
    setEstadoEdit(curso.estado);
    setMostrandoModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrandoModalEditar(false);
    setCursoEditando(null);
  };

  const handleGuardarEdicion = async () => {
    if (!cursoEditando) return;
    if (!nombreEdit.trim()) {
      alert("El nombre del curso es obligatorio.");
      return;
    }

    try {
      setGuardandoEdit(true);
      const actualizado = await actualizarCursoDocente(cursoEditando._id, {
        nombre: nombreEdit.trim(),
        descripcion: descripcionEdit.trim(),
        estado: estadoEdit,
      });

      setCursos((prev) =>
        prev.map((c) => (c._id === actualizado._id ? actualizado : c))
      );
      cerrarModalEditar();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el curso.");
    } finally {
      setGuardandoEdit(false);
    }
  };

  // ================== CAMBIAR ESTADO ==================
  const handleToggleEstado = async (curso: Curso) => {
    const nuevoEstado: EstadoCurso =
      curso.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      const actualizado = await cambiarEstadoCursoDocente(
        curso._id,
        nuevoEstado
      );

      setCursos((prev) =>
        prev.map((c) => (c._id === actualizado._id ? actualizado : c))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado del curso.");
    }
  };

  // ================== ELIMINAR ==================
  const handleEliminar = async (curso: Curso) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar el curso "${curso.nombre}"? ` +
          "Solo es posible si no tiene estudiantes inscritos."
      )
    ) {
      return;
    }

    try {
      await eliminarCursoDocente(curso._id);
      setCursos((prev) => prev.filter((c) => c._id !== curso._id));
    } catch (err: unknown) {
      console.error(err);

      const axiosLike = err as {
        response?: { data?: { message?: string } };
      };

      const msg =
        axiosLike.response?.data?.message ||
        "No se pudo eliminar el curso.";
      alert(msg);
    }
  };

  // ================== UI ESTADOS GENERALES ==================
  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#e5e7eb",
        }}
      >
        Cargando tus cursos...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#fecaca",
        }}
      >
        {error}
      </div>
    );
  }

  // ================== UI PRINCIPAL ==================
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f2937 0, #020617 40%, #020617 100%)",
        fontFamily: "system-ui, sans-serif",
        color: "#e5e7eb",
      }}
    >
      {/* TOP BAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(14px)",
          background:
            "linear-gradient(to right, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
          borderBottom: "1px solid rgba(30,64,175,0.4)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "10px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background:
                  "conic-gradient(from 180deg, #6366f1, #22c55e, #ec4899, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 2px rgba(15,23,42,0.9)",
                fontSize: 16,
              }}
            >
              🎓
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#9ca3af",
                }}
              >
                NeuroLearn · Docente
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#e5e7eb",
                }}
              >
                Gestión de cursos
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              onClick={() => navigate("/docente")}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "transparent",
                color: "#e5e7eb",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Panel
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "7px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#ef4444,#f97316,#facc15)",
                color: "#0f172a",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 26px rgba(248,113,113,0.45)",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 28px 40px",
        }}
      >
        {/* HEADER CONTENIDO */}
        <section
          style={{
            marginBottom: 22,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 700,
                marginBottom: 4,
                color: "#f9fafb",
                letterSpacing: "-0.03em",
              }}
            >
              Mis cursos
            </h1>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.94rem",
                margin: 0,
              }}
            >
              Crea, edita y administra los cursos que impartes en la
              plataforma.
            </p>
          </div>

          {/* Buscador compacto arriba */}
          <div
            style={{
              minWidth: 220,
              flexShrink: 0,
              backgroundColor: "#020617",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.4)",
              padding: "6px 14px",
              boxShadow: "0 12px 26px rgba(15,23,42,0.7)",
            }}
          >
            <input
              type="text"
              placeholder="Buscar curso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "0.85rem",
                color: "#e5e7eb",
                background: "transparent",
              }}
            />
          </div>
        </section>

        {/* BLOQUE: CREAR CURSO RÁPIDO */}
        <section
          style={{
            marginBottom: 22,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
            borderRadius: 20,
            padding: "16px 18px 14px",
            boxShadow: "0 18px 46px rgba(15,23,42,0.8)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              margin: 0,
              marginBottom: 6,
              color: "#e5e7eb",
              fontWeight: 600,
            }}
          >
            Crear nuevo curso
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: 12,
              fontSize: "0.85rem",
              color: "#9ca3af",
            }}
          >
            Define el nombre y una breve descripción. El curso se creará
            como <strong>Activo</strong> automáticamente.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Nombre del curso"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              style={{
                flex: "1 1 220px",
                minWidth: 200,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid #4b5563",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#020617",
                color: "#e5e7eb",
              }}
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              style={{
                flex: "2 1 260px",
                minWidth: 220,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid #4b5563",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#020617",
                color: "#e5e7eb",
              }}
            />

            <button
              onClick={handleCrearCurso}
              disabled={creando}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                opacity: creando ? 0.7 : 1,
                whiteSpace: "nowrap",
                boxShadow: "0 14px 30px rgba(79,70,229,0.8)",
              }}
            >
              {creando ? "Creando..." : "Crear curso"}
            </button>
          </div>
        </section>

        {/* GRID DE CURSOS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {cursosFiltrados.map((curso) => (
            <CursoCardDocente
              key={curso._id}
              curso={curso}
              onEditar={() => abrirModalEditar(curso)}
              onEliminar={() => handleEliminar(curso)}
              onToggleEstado={() => handleToggleEstado(curso)}
              onVerDetalle={() => navigate(`/docente/cursos/${curso._id}`)}
            />
          ))}

          {cursosFiltrados.length === 0 && (
            <p
              style={{
                color: "#9ca3af",
                gridColumn: "1/-1",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              No tienes cursos que coincidan con la búsqueda.
            </p>
          )}
        </section>
      </main>

      {/* MODAL EDITAR */}
      {mostrandoModalEditar && cursoEditando && (
        <ModalEditarCursoDocente
          nombre={nombreEdit}
          descripcion={descripcionEdit}
          estado={estadoEdit}
          setNombre={setNombreEdit}
          setDescripcion={setDescripcionEdit}
          setEstado={setEstadoEdit}
          onClose={cerrarModalEditar}
          onSave={handleGuardarEdicion}
          guardando={guardandoEdit}
        />
      )}
    </div>
  );
};

export default CursosDocentePage;

/* ============= CARD DE CURSO (DOCENTE) ============= */

const CursoCardDocente = ({
  curso,
  onEditar,
  onEliminar,
  onToggleEstado,
  onVerDetalle,
}: {
  curso: Curso;
  onEditar: () => void;
  onEliminar: () => void;
  onToggleEstado: () => void;
  onVerDetalle: () => void;
}) => {
  const badgeEstadoStyle: CSSProperties = {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor:
      curso.estado === "Activo"
        ? "rgba(22,163,74,0.12)"
        : "rgba(148,163,184,0.18)",
    color: curso.estado === "Activo" ? "#4ade80" : "#cbd5f5",
    border:
      curso.estado === "Activo"
        ? "1px solid rgba(34,197,94,0.6)"
        : "1px solid rgba(148,163,184,0.6)",
  };

  return (
    <article
      style={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,1), rgba(15,23,42,0.96))",
        borderRadius: 20,
        padding: "16px 18px 14px",
        boxShadow: "0 18px 46px rgba(15,23,42,0.9)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: "1px solid rgba(148,163,184,0.4)",
      }}
    >
      {/* TOP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#f9fafb",
            }}
          >
            {curso.nombre}
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "0.83rem",
              color: "#9ca3af",
            }}
          >
            {curso.descripcion || "Curso sin descripción."}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={badgeEstadoStyle}>{curso.estado}</span>
          <button
            onClick={onToggleEstado}
            style={{
              marginTop: 6,
              border: "none",
              background: "transparent",
              fontSize: "0.73rem",
              color: "#9ca3af",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {curso.estado === "Activo"
              ? "Marcar inactivo"
              : "Marcar activo"}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: "0.8rem",
          color: "#9ca3af",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div>
          <span style={{ marginRight: 12 }}>
            <strong>Estudiantes:</strong> {curso.totalEstudiantes ?? 0}
          </span>
          <span>
            <strong>Quizzes:</strong> {curso.totalQuizzes ?? 0}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onVerDetalle}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Ver curso
          </button>
          <button
            onClick={onEditar}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "transparent",
              color: "#e5e7eb",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Editar
          </button>
          <button
            onClick={onEliminar}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
};

/* ============= MODAL EDITAR CURSO (DOCENTE) ============= */

const ModalEditarCursoDocente = ({
  nombre,
  descripcion,
  estado,
  setNombre,
  setDescripcion,
  setEstado,
  onClose,
  onSave,
  guardando,
}: {
  nombre: string;
  descripcion: string;
  estado: EstadoCurso;
  setNombre: (v: string) => void;
  setDescripcion: (v: string) => void;
  setEstado: (v: EstadoCurso) => void;
  onClose: () => void;
  onSave: () => void;
  guardando: boolean;
}) => {
  const overlay: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  };

  const modal: CSSProperties = {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: "18px 20px 16px",
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.6)",
    color: "#e5e7eb",
  };

  const label: CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#e5e7eb",
    marginBottom: 4,
    display: "block",
  };

  const input: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #4b5563",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 8,
    backgroundColor: "#020617",
    color: "#f9fafb",
  };

  const textarea: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #4b5563",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 8,
    minHeight: 70,
    resize: "vertical",
    backgroundColor: "#020617",
    color: "#f9fafb",
  };

  const select: CSSProperties = {
    ...input,
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: 6,
            color: "#f9fafb",
          }}
        >
          Editar curso
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: "#9ca3af",
            marginBottom: 12,
          }}
        >
          Ajusta los datos del curso y guarda los cambios.
        </p>

        <div style={{ marginBottom: 6 }}>
          <label style={label}>Nombre del curso</label>
          <input
            style={input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 6 }}>
          <label style={label}>Descripción</label>
          <textarea
            style={textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={label}>Estado</label>
          <select
            style={select}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoCurso)}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 4,
          }}
        >
          <button
            onClick={onClose}
            disabled={guardando}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "transparent",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "#e5e7eb",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={guardando}
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
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};
