import { useEffect, useMemo, useState } from "react";
import AdminTopBar from "../../components/admin/AdminTopBar";
import {
  getCursos,
  updateCurso,
  deleteCurso,
  cambiarEstadoCurso,
  type Curso,
  type EstadoCurso,
} from "../../services/courseService";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const CursosAdminPage = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // Modal editar
  const [mostrandoModalEditar, setMostrandoModalEditar] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [docenteEdit, setDocenteEdit] = useState("");
  const [estadoEdit, setEstadoEdit] = useState<EstadoCurso>("Activo");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null);
        const data = await getCursos();
        setCursos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los cursos.");
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
      const docente = c.docenteNombre ?? "";
      return (
        c.nombre.toLowerCase().includes(text) ||
        docente.toLowerCase().includes(text)
      );
    });
  }, [cursos, busqueda]);

  const abrirDetalle = (curso: Curso) => {
    navigate(`/admin/cursos/${curso._id}`, { state: { curso } });
  };

  // ====== EDITAR ======
  const abrirModalEditar = (curso: Curso) => {
    setCursoEditando(curso);
    setNombreEdit(curso.nombre);
    setDescripcionEdit(curso.descripcion ?? "");
    setDocenteEdit(curso.docenteNombre ?? "");
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
      setGuardando(true);
      const actualizado = await updateCurso(cursoEditando._id, {
        nombre: nombreEdit.trim(),
        descripcion: descripcionEdit.trim(),
        docenteNombre: docenteEdit.trim() || "Sin asignar",
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
      setGuardando(false);
    }
  };

  // ====== ELIMINAR ======
  const handleEliminar = async (curso: Curso) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar el curso "${curso.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await deleteCurso(curso._id);
      setCursos((prev) => prev.filter((c) => c._id !== curso._id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el curso.");
    }
  };

  // ====== CAMBIAR ESTADO ======
  const handleToggleEstado = async (curso: Curso) => {
    const nuevoEstado: EstadoCurso =
      curso.estado === "Activo" ? "Inactivo" : "Activo";
    try {
      const actualizado = await cambiarEstadoCurso(curso._id, nuevoEstado);
      setCursos((prev) =>
        prev.map((c) => (c._id === actualizado._id ? actualizado : c))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado del curso.");
    }
  };

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
        Cargando cursos...
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <AdminTopBar />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 32px 40px",
        }}
      >
        {/* HEADER */}
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              marginBottom: 4,
              color: "#0f172a",
            }}
          >
            Gestión de Cursos
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Administra todos los cursos de la plataforma.
          </p>
        </header>

        {/* BUSCADOR */}
        <div
          style={{
            marginBottom: 22,
            backgroundColor: "#ffffff",
            borderRadius: 999,
            boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
            padding: "8px 18px",
          }}
        >
          <input
            type="text"
            placeholder="Buscar cursos por nombre o docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "0.9rem",
              color: "#111827",
            }}
          />
        </div>

        {/* GRID DE CURSOS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {cursosFiltrados.map((curso) => (
            <CursoCard
              key={curso._id}
              curso={curso}
              onVerDetalle={() => abrirDetalle(curso)}
              onEditar={() => abrirModalEditar(curso)}
              onEliminar={() => handleEliminar(curso)}
              onToggleEstado={() => handleToggleEstado(curso)}
            />
          ))}

          {cursosFiltrados.length === 0 && (
            <p style={{ color: "#6b7280", gridColumn: "1/-1" }}>
              No hay cursos que coincidan con la búsqueda.
            </p>
          )}
        </section>
      </main>

      {/* MODAL EDITAR CURSO */}
      {mostrandoModalEditar && cursoEditando && (
        <ModalEditarCurso
          nombre={nombreEdit}
          descripcion={descripcionEdit}
          docente={docenteEdit}
          estado={estadoEdit}
          setNombre={setNombreEdit}
          setDescripcion={setDescripcionEdit}
          setDocente={setDocenteEdit}
          setEstado={setEstadoEdit}
          onClose={cerrarModalEditar}
          onSave={handleGuardarEdicion}
          guardando={guardando}
        />
      )}
    </div>
  );
};

export default CursosAdminPage;

/* ================== COMPONENTE CARD ================== */

const CursoCard = ({
  curso,
  onVerDetalle,
  onEditar,
  onEliminar,
  onToggleEstado,
}: {
  curso: Curso;
  onVerDetalle: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onToggleEstado: () => void;
}) => {
  const badgeEstadoStyle: CSSProperties = {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor:
      curso.estado === "Activo" ? "rgba(22,163,74,0.12)" : "rgba(148,163,184,0.18)",
    color: curso.estado === "Activo" ? "#16a34a" : "#475569",
  };

  const iconWrapper: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 20,
    boxShadow: "0 16px 30px rgba(37,99,235,0.35)",
  };

  return (
    <article
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: "18px 20px 16px",
        boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={iconWrapper}>📘</div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {curso.nombre}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              Docente:{" "}
              <span style={{ fontWeight: 600 }}>
                {curso.docenteNombre ?? "Sin asignar"}
              </span>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={badgeEstadoStyle}>{curso.estado}</span>

          <button
            onClick={onToggleEstado}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "0.75rem",
              color: "#4b5563",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {curso.estado === "Activo" ? "Marcar inactivo" : "Marcar activo"}
          </button>
        </div>
      </div>

      {/* Descripción */}
      <p
        style={{
          margin: "4px 0",
          fontSize: "0.88rem",
          color: "#4b5563",
        }}
      >
        {curso.descripcion || "Curso sin descripción."}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: "0.8rem",
          color: "#6b7280",
          alignItems: "center",
          gap: 12,
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
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ver detalles
          </button>

          <button
            onClick={onEditar}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
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

/* =============== MODAL EDITAR CURSO =============== */

const ModalEditarCurso = ({
  nombre,
  descripcion,
  docente,
  estado,
  setNombre,
  setDescripcion,
  setDocente,
  setEstado,
  onClose,
  onSave,
  guardando,
}: {
  nombre: string;
  descripcion: string;
  docente: string;
  estado: EstadoCurso;
  setNombre: (v: string) => void;
  setDescripcion: (v: string) => void;
  setDocente: (v: string) => void;
  setEstado: (v: EstadoCurso) => void;
  onClose: () => void;
  onSave: () => void;
  guardando: boolean;
}) => {
  const overlay: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  };

  const modal: CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: "18px 20px 16px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 24px 60px rgba(15,23,42,0.5)",
  };

  const label: CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#4b5563",
    marginBottom: 4,
    display: "block",
  };

  const input: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 10,
  };

  const textarea: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: 10,
    minHeight: 70,
    resize: "vertical",
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
            color: "#0f172a",
          }}
        >
          Editar curso
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: "#4b5563",
            marginBottom: 12,
          }}
        >
          Ajusta la información del curso y guarda los cambios.
        </p>

        <div style={{ marginBottom: 8 }}>
          <label style={label}>Nombre del curso</label>
          <input
            style={input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={label}>Descripción</label>
          <textarea
            style={textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={label}>Docente</label>
          <input
            style={input}
            value={docente}
            onChange={(e) => setDocente(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
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
