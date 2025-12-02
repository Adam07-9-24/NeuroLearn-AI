// src/pages/estudiante/MiCursoDetallePage.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { CursoEstudiante } from "../../services/courseService";
import {
  getCursoEstudianteDetalle,
  salirCurso,
} from "../../services/studentCourseService";
import type { Quiz } from "../../services/quizService";

interface QuizEstudiante extends Quiz {
  estadoEstudiante?: "pendiente" | "completado";
  puntaje?: number | null;
}

interface CursoEstudianteDetalleResponse {
  curso: CursoEstudiante;
  quizzes: QuizEstudiante[];
}

// La API puede devolver:
//  - la forma nueva: { curso, quizzes }
//  - la forma vieja: solo el curso (con quizzes opcional)
type CursoDetalleApiResponse =
  | CursoEstudianteDetalleResponse
  | (CursoEstudiante & { quizzes?: QuizEstudiante[] });

const MiCursoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<CursoEstudiante | null>(null);
  const [quizzes, setQuizzes] = useState<QuizEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progreso calculado según quizzes completados
  const progreso =
    quizzes.length > 0
      ? Math.round(
          (quizzes.filter((q) => q.estadoEstudiante === "completado").length /
            quizzes.length) *
            100
        )
      : 0;

  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      try {
        setError(null);

        const raw = await getCursoEstudianteDetalle(id);
        const data = raw as CursoDetalleApiResponse;

        let cursoResp: CursoEstudiante;
        let quizzesResp: QuizEstudiante[];

        // Forma nueva: { curso, quizzes }
        if ("curso" in data && "quizzes" in data) {
          cursoResp = data.curso;
          quizzesResp = data.quizzes ?? [];
        } else {
          // Forma vieja: solo el curso, con quizzes opcional
          cursoResp = data;
          quizzesResp = data.quizzes ?? [];
        }

        setCurso(cursoResp);
        setQuizzes(quizzesResp);
      } catch (err) {
        console.error(err);

        let msg = "No se pudo cargar la información del curso.";
        const axiosErr = err as AxiosError<{ message?: string }>;
        if (axiosErr.response?.data?.message) {
          msg = axiosErr.response.data.message;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleSalirCurso = async () => {
    if (!curso?._id) return;

    const confirmar = window.confirm(
      "¿Seguro que quieres salir de este curso? Ya no aparecerá en tu lista."
    );
    if (!confirmar) return;

    try {
      setError(null);
      await salirCurso(curso._id);
      // Opcional: podrías mostrar un toast
      navigate("/estudiante");
    } catch (err) {
      console.error(err);
      setError("No se pudo salir del curso. Inténtalo nuevamente.");
    }
  };

  if (loading) {
    return <div style={center}>Cargando curso...</div>;
  }

  if (error || !curso) {
    return (
      <div style={center}>
        <p style={{ color: "#f87171", marginBottom: 10 }}>
          {error || "Curso no encontrado."}
        </p>
        <button style={btnSecondary} onClick={() => navigate("/estudiante")}>
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div style={layout}>
      <main style={mainCard}>
        {/* HEADER */}
        <header style={header}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button
              onClick={() => navigate("/estudiante")}
              style={{ ...btnSecondary, marginBottom: 8 }}
            >
              ← Volver
            </button>

            {/* Botón para salir del curso */}
            <button
              onClick={handleSalirCurso}
              style={btnSalirCurso}
            >
              Salir del curso
            </button>
          </div>

          <h1 style={title}>{curso.nombre}</h1>
          <p style={subtitle}>
            Docente: <strong>{curso.docenteNombre || "No asignado"}</strong>
          </p>

          <p style={desc}>
            {curso.descripcion || "Este curso no tiene descripción."}
          </p>
        </header>

        {/* INFORMACIÓN DEL CURSO */}
        <section style={infoGrid}>
          <div style={infoBox}>
            <p style={infoLabel}>Estado</p>
            <p style={infoValue}>{curso.estado}</p>
          </div>

          <div style={infoBox}>
            <p style={infoLabel}>Estudiantes inscritos</p>
            <p style={infoValue}>{curso.totalEstudiantes ?? 0}</p>
          </div>

          <div style={infoBox}>
            <p style={infoLabel}>Quizzes del curso</p>
            <p style={infoValue}>
              {curso.totalQuizzes ?? quizzes.length ?? 0}
            </p>
          </div>

          <div style={infoBox}>
            <p style={infoLabel}>Tu progreso</p>
            <div style={progressBar}>
              <div
                style={{
                  ...progressInner,
                  width: `${progreso}%`,
                }}
              />
            </div>
            <p style={{ marginTop: 4, fontSize: "0.8rem" }}>
              {progreso}% completado
            </p>
          </div>
        </section>

        {/* QUIZZES DEL CURSO */}
        <section style={quizzesSection}>
          <h2 style={sectionTitle}>Quizzes disponibles</h2>

          {quizzes.length === 0 ? (
            <p style={mutedText}>Este curso aún no tiene quizzes.</p>
          ) : (
            <div style={quizList}>
              {quizzes.map((quiz) => (
                <div key={quiz._id} style={quizCard}>
                  <h3 style={quizTitle}>{quiz.titulo}</h3>
                  <p style={mutedText}>
                    Preguntas: {quiz.preguntas?.length ?? 0}
                  </p>

                  {quiz.estado === "Publicado" ? (
                    quiz.estadoEstudiante === "completado" ? (
                      <span style={badgeCompleted}>
                        ✔ Quiz completado
                        {quiz.puntaje != null && ` · ${quiz.puntaje}/10`}
                      </span>
                    ) : (
                      <button
                        style={btnPrimary}
                        onClick={() =>
                          navigate(`/estudiante/quizzes/${quiz._id}`)
                        }
                      >
                        Empezar quiz
                      </button>
                    )
                  ) : (
                    <span style={badgePending}>Aún no publicado</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* UNIRSE POR CÓDIGO */}
        <section style={joinQuizSection}>
          <h2 style={sectionTitle}>Unirme con código Kahoot</h2>
          <button
            style={btnPrimary}
            onClick={() => navigate("/estudiante/ingresar-quiz")}
          >
            Ingresar código de quiz
          </button>
        </section>
      </main>
    </div>
  );
};

/* ========= ESTILOS ========= */

const layout: CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #0f172a, #020617 70%)",
  padding: "24px 16px",
  fontFamily: "system-ui, sans-serif",
};

const center: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  alignItems: "center",
  justifyContent: "center",
  color: "#e5e7eb",
};

const mainCard: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "rgba(15,23,42,0.96)",
  borderRadius: 16,
  padding: "20px 24px",
  border: "1px solid rgba(148,163,184,0.35)",
  color: "#e5e7eb",
  boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
};

const header: CSSProperties = {
  marginBottom: 20,
};

const title: CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 700,
  margin: "0 0 4px",
};

const subtitle: CSSProperties = {
  fontSize: "1rem",
  color: "#a5b4fc",
  margin: "0 0 4px",
};

const desc: CSSProperties = {
  fontSize: "0.9rem",
  color: "#9ca3af",
  maxWidth: 700,
};

const infoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  margin: "20px 0",
};

const infoBox: CSSProperties = {
  background: "rgba(30,41,59,0.6)",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(55,65,81,0.7)",
};

const infoLabel: CSSProperties = {
  fontSize: "0.8rem",
  color: "#9ca3af",
};

const infoValue: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
};

const progressBar: CSSProperties = {
  width: "100%",
  height: 8,
  background: "#334155",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 4,
};

const progressInner: CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg,#6366f1,#ec4899)",
};

const quizzesSection: CSSProperties = {
  marginTop: 24,
};

const sectionTitle: CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 600,
  marginBottom: 10,
};

const quizList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const quizCard: CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(30,41,59,0.7)",
  border: "1px solid rgba(75,85,99,0.6)",
};

const quizTitle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  margin: 0,
};

const mutedText: CSSProperties = {
  fontSize: "0.86rem",
  color: "#9ca3af",
};

const badgePending: CSSProperties = {
  padding: "4px 10px",
  background: "rgba(251,191,36,0.25)",
  color: "#fbbf24",
  borderRadius: 999,
  fontSize: "0.8rem",
  fontWeight: 500,
};

const badgeCompleted: CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "5px 12px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.25)",
  color: "#4ade80",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const btnPrimary: CSSProperties = {
  marginTop: 8,
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const btnSecondary: CSSProperties = {
  padding: "6px 14px",
  borderRadius: 999,
  border: "1px solid #64748b",
  background: "rgba(15,23,42,0.9)",
  color: "#e5e7eb",
  cursor: "pointer",
};

const btnSalirCurso: CSSProperties = {
  padding: "6px 14px",
  borderRadius: 999,
  border: "1px solid #b91c1c",
  background: "rgba(153,27,27,0.15)",
  color: "#fecaca",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const joinQuizSection: CSSProperties = {
  marginTop: 30,
  paddingTop: 12,
  borderTop: "1px solid rgba(75,85,99,0.6)",
};

export default MiCursoDetallePage;
