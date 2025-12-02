// src/pages/estudiante/EstudianteDashboard.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { useAuth } from "../../context/useAuth";

// 👇 USAR CursoEstudiante, no Curso
import type { CursoEstudiante } from "../../services/courseService";

import {
  getCursosEstudiante,
  unirseCurso,
} from "../../services/studentCourseService";

const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ⬅️ ahora también usamos logout

  const [cursos, setCursos] = useState<CursoEstudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursoUnirseLoading, setCursoUnirseLoading] = useState<string | null>(
    null
  );

  // ==============================
  // CARGAR CURSOS
  // ==============================
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setError(null);
        const data = await getCursosEstudiante(); // devuelve CursoEstudiante[]
        setCursos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los cursos disponibles.");
      } finally {
        setCargando(false);
      }
    };
    cargarCursos();
  }, []);

  // ==============================
  // EXTRAER NOMBRE DEL USUARIO
  // ==============================
  const nombreMostrado =
    typeof user === "object" && user
      ? (user as { nombre?: string; email?: string }).nombre ||
        (user as { nombre?: string; email?: string }).email ||
        "Estudiante"
      : "Estudiante";

  // ==============================
  // UNIRSE A CURSO
  // ==============================
  const handleUnirseCurso = async (cursoId: string) => {
    try {
      setCursoUnirseLoading(cursoId);
      const actualizado = await unirseCurso(cursoId); // CursoEstudiante

      // Reemplazar curso actualizado en el estado
      setCursos((prev) =>
        prev.map((c) => (c._id === cursoId ? actualizado : c))
      );

      alert("Te uniste al curso correctamente 🎉");
    } catch (err) {
      console.error(err);

      let mensaje = "No se pudo unir al curso. Intenta nuevamente.";
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.data?.message) {
        mensaje = axiosErr.response.data.message;
      }

      alert(mensaje);
    } finally {
      setCursoUnirseLoading(null);
    }
  };

  // ==============================
  // DIVIDIR CURSOS: INSCRITOS / DISPONIBLES
  // ==============================
  const cursosInscrito = cursos.filter((c) => c.yaInscrito === true);
  const cursosDisponibles = cursos.filter((c) => !c.yaInscrito);

  const totalInscritos = cursosInscrito.length;
  const totalDisponibles = cursosDisponibles.length;

  return (
    <div style={layout}>
      {/* NAV SUPERIOR */}
     <nav style={navBar}>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span style={navLogo}>NeuroLearn</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <span style={navUser}>{nombreMostrado}</span>

    <button
      onClick={() => {
        logout();
        navigate("/login");
      }}
      style={navButton}
    >
      Cerrar sesión
    </button>
  </div>
</nav>

      <main style={mainCard}>
        {/* HEADER */}
        <header style={header}>
          <div>
            <p style={helloText}>Hola 👋</p>
            <h1 style={title}>{nombreMostrado}</h1>
            <p style={subtitle}>
              Bienvenido a{" "}
              <span style={{ color: "#a5b4fc", fontWeight: 600 }}>
                NeuroLearn
              </span>
              . Organiza tus cursos y entra a quizzes tipo Kahoot en segundos.
            </p>
          </div>

          <div style={headerStats}>
            <div style={statCard}>
              <p style={statLabel}>Cursos inscritos</p>
              <p style={statValue}>{totalInscritos}</p>
            </div>
            <div style={statCard}>
              <p style={statLabel}>Cursos disponibles</p>
              <p style={statValue}>{totalDisponibles}</p>
            </div>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <section style={grid}>
          {/* ============================
              COLUMNA IZQUIERDA
          =============================== */}
          <article style={leftColumn}>
            {/* ====== MIS CURSOS ====== */}
            <div style={sectionHeaderRow}>
              <h2 style={sectionTitle}>Mis cursos</h2>
              {totalInscritos > 0 && (
                <span style={sectionChip}>{totalInscritos} activos</span>
              )}
            </div>

            {cargando ? (
              <p style={mutedText}>Cargando cursos...</p>
            ) : error ? (
              <p style={errorText}>{error}</p>
            ) : cursosInscrito.length === 0 ? (
              <p style={mutedText}>
                Aún no estás inscrito en ningún curso. Revisa la sección de{" "}
                <strong>Otros cursos disponibles</strong>.
              </p>
            ) : (
              <div style={coursesList}>
                {cursosInscrito.map((curso) => (
                  <div key={curso._id} style={courseCard}>
                    <div style={courseCardHeader}>
                      <div>
                        <h3 style={courseTitle}>{curso.nombre}</h3>
                        <p style={courseTeacher}>
                          Docente: {curso.docenteNombre || "No asignado"}
                        </p>
                      </div>
                      <span style={badgeInscrito}>Inscrito</span>
                    </div>

                    <div style={courseMetaRow}>
                      <div style={courseMetaText}>
                        <span style={courseMetaDot} />{" "}
                        <span
                          style={{ fontSize: "0.78rem", color: "#9ca3af" }}
                        >
                          {curso.totalQuizzes ?? 0} quizzes ·{" "}
                          {curso.totalEstudiantes ?? 0} estudiantes
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/estudiante/curso/${curso._id}`)
                        }
                        style={primarySmallButton}
                      >
                        Entrar al curso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ====== CURSOS DISPONIBLES ====== */}
            <div style={{ ...sectionHeaderRow, marginTop: 22 }}>
              <h2 style={sectionTitle}>Otros cursos disponibles</h2>
              {totalDisponibles > 0 && (
                <span style={sectionChip}>{totalDisponibles} cursos</span>
              )}
            </div>

            {cargando ? (
              <p style={mutedText}>Cargando cursos...</p>
            ) : error ? (
              <p style={errorText}>{error}</p>
            ) : cursosDisponibles.length === 0 ? (
              <p style={mutedText}>
                No hay más cursos para unirte por ahora. Vuelve más tarde ✨
              </p>
            ) : (
              <div style={coursesList}>
                {cursosDisponibles.map((curso) => (
                  <div key={curso._id} style={courseCardMuted}>
                    <div style={courseCardHeader}>
                      <div>
                        <h3 style={courseTitle}>{curso.nombre}</h3>
                        <p style={courseTeacher}>
                          Docente: {curso.docenteNombre || "No asignado"}
                        </p>
                      </div>
                      <span style={badgeEstado}>
                        {curso.estado === "Activo" ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div style={courseMetaRow}>
                      <div style={courseMetaText}>
                        <span style={courseMetaDotSecondary} />{" "}
                        <span
                          style={{ fontSize: "0.78rem", color: "#9ca3af" }}
                        >
                          {curso.totalQuizzes ?? 0} quizzes disponibles
                        </span>
                      </div>

                      <button
                        onClick={() => handleUnirseCurso(curso._id)}
                        disabled={
                          cursoUnirseLoading === curso._id ||
                          curso.estado !== "Activo"
                        }
                        style={{
                          ...secondarySmallButton,
                          opacity:
                            cursoUnirseLoading === curso._id ||
                            curso.estado !== "Activo"
                              ? 0.6
                              : 1,
                        }}
                      >
                        {cursoUnirseLoading === curso._id
                          ? "Uniendo..."
                          : "Unirme al curso"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* ============================
              COLUMNA DERECHA
          =============================== */}
          <aside style={rightColumn}>
            <h2 style={sectionTitle}>Unirme a un quiz</h2>
            <p style={mutedText}>
              Usa un código tipo Kahoot que te comparta tu docente para
              entrar directamente a un quiz en vivo.
            </p>

            <div style={joinCard}>
              <div style={joinBadge}>Kahoot mode</div>
              <p style={joinTitle}>Código tipo Kahoot</p>
              <p style={joinText}>
                Cuando un docente publica un quiz, se genera un código único.
                Escríbelo y entra al juego al instante.
              </p>
              <button
                onClick={() => navigate("/estudiante/ingresar-quiz")}
                style={joinButton}
              >
                Ingresar código
              </button>

              <p style={joinHint}>
                ¿Ya completaste un quiz? Podrás ver tu progreso dentro del
                curso.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

/* ============================
    ESTILOS
=============================== */

const layout: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #020617 0, #020617 40%, #020617 100%)",
  padding: "24px 16px",
  fontFamily: "system-ui, sans-serif",
};

const mainCard: CSSProperties = {
  maxWidth: 1150,
  margin: "0 auto",
  backgroundColor: "rgba(15,23,42,0.98)",
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.4)",
  padding: "22px 22px 26px",
  boxShadow: "0 30px 90px rgba(15,23,42,0.9)",
  color: "#e5e7eb",
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 18,
};

const helloText: CSSProperties = {
  fontSize: "0.9rem",
  color: "#9ca3af",
  margin: 0,
};

const title: CSSProperties = {
  fontSize: "2rem",
  fontWeight: 800,
  margin: "4px 0 6px",
  letterSpacing: "-0.03em",
};

const subtitle: CSSProperties = {
  fontSize: "0.92rem",
  color: "#9ca3af",
  maxWidth: 560,
  margin: 0,
  lineHeight: 1.5,
};

const headerStats: CSSProperties = {
  display: "flex",
  gap: 10,
};

const statCard: CSSProperties = {
  minWidth: 120,
  padding: "8px 10px",
  borderRadius: 14,
  background:
    "linear-gradient(135deg,rgba(30,64,175,0.25),rgba(129,140,248,0.12))",
  border: "1px solid rgba(129,140,248,0.5)",
};

const statLabel: CSSProperties = {
  fontSize: "0.75rem",
  color: "#cbd5f5",
  marginBottom: 3,
};

const statValue: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
  gap: 20,
  marginTop: 12,
};

const leftColumn: CSSProperties = {
  backgroundColor: "rgba(15,23,42,0.98)",
  borderRadius: 18,
  padding: "14px 14px 12px",
  border: "1px solid rgba(55,65,81,0.9)",
};

const rightColumn: CSSProperties = {
  backgroundColor: "rgba(15,23,42,0.98)",
  borderRadius: 18,
  padding: "14px 14px 12px",
  border: "1px solid rgba(55,65,81,0.9)",
};

const sectionHeaderRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const sectionTitle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: 6,
};

const sectionChip: CSSProperties = {
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.5)",
  fontSize: "0.7rem",
  color: "#cbd5f5",
};

const mutedText: CSSProperties = {
  fontSize: "0.88rem",
  color: "#9ca3af",
  marginTop: 4,
};

const errorText: CSSProperties = {
  fontSize: "0.9rem",
  color: "#fca5a5",
};

const coursesList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 6,
};

const courseCardBase: CSSProperties = {
  borderRadius: 14,
  padding: "10px 12px",
  border: "1px solid rgba(75,85,99,0.85)",
};

const courseCard: CSSProperties = {
  ...courseCardBase,
  background:
    "linear-gradient(130deg,rgba(15,23,42,0.98),rgba(37,99,235,0.16))",
};

const courseCardMuted: CSSProperties = {
  ...courseCardBase,
  background:
    "linear-gradient(130deg,rgba(15,23,42,0.98),rgba(148,163,184,0.12))",
};

const courseCardHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 6,
};

const courseTitle: CSSProperties = {
  fontSize: "0.98rem",
  fontWeight: 600,
  margin: 0,
};

const courseTeacher: CSSProperties = {
  fontSize: "0.8rem",
  color: "#a5b4fc",
  margin: "2px 0 2px",
};

const courseMetaRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
};

const courseMetaText: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const courseMetaDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background:
    "radial-gradient(circle, #22c55e 0, #16a34a 40%, #052e16 100%)",
};

const courseMetaDotSecondary: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background:
    "radial-gradient(circle, #38bdf8 0, #0ea5e9 40%, #082f49 100%)",
};

const badgeInscrito: CSSProperties = {
  padding: "3px 10px",
  borderRadius: 999,
  backgroundColor: "rgba(22,163,74,0.18)",
  color: "#4ade80",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const badgeEstado: CSSProperties = {
  padding: "3px 10px",
  borderRadius: 999,
  backgroundColor: "rgba(59,130,246,0.12)",
  color: "#93c5fd",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const joinCard: CSSProperties = {
  marginTop: 8,
  padding: "12px 13px",
  borderRadius: 16,
  background:
    "linear-gradient(135deg,rgba(79,70,229,0.2),rgba(236,72,153,0.24))",
  border: "1px solid rgba(129,140,248,0.9)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.9)",
};

const joinBadge: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid rgba(219,234,254,0.7)",
  fontSize: "0.7rem",
  color: "#e0f2fe",
  marginBottom: 8,
};

const joinTitle: CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
  marginBottom: 4,
};

const joinText: CSSProperties = {
  fontSize: "0.82rem",
  color: "#e5e7eb",
  marginBottom: 10,
  lineHeight: 1.5,
};

const joinButton: CSSProperties = {
  width: "100%",
  padding: "9px 14px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const joinHint: CSSProperties = {
  marginTop: 8,
  fontSize: "0.75rem",
  color: "#e5e7eb",
  opacity: 0.85,
};

const primarySmallButton: CSSProperties = {
  padding: "7px 14px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#10b981,#22c55e,#16a34a)",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "0.82rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const secondarySmallButton: CSSProperties = {
  padding: "7px 14px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.8)",
  background: "rgba(15,23,42,0.9)",
  color: "#e5e7eb",
  fontWeight: 600,
  fontSize: "0.82rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/* ============================
   NAV BAR SUPERIOR
=============================== */

const navBar: CSSProperties = {
  width: "100%",
  maxWidth: 1150,
  margin: "0 auto 18px auto",
  padding: "10px 18px",
  borderRadius: 18,
  background: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(75,85,99,0.5)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 8,
  backdropFilter: "blur(10px)",
  zIndex: 20,
};

const navLogo: CSSProperties = {
  color: "#a5b4fc",
  fontWeight: 700,
  fontSize: "1.2rem",
  letterSpacing: "-0.02em",
};

const navUser: CSSProperties = {
  color: "#e5e7eb",
  fontSize: "0.9rem",
  opacity: 0.85,
};

const navButton: CSSProperties = {
  padding: "6px 11px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#ef4444,#dc2626,#b91c1c)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.8rem",
  cursor: "pointer",
  
};

export default EstudianteDashboard;
