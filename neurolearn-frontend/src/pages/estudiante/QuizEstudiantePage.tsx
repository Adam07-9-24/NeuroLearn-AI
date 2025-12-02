// src/pages/estudiante/QuizEstudiantePage.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  type Quiz,
  type QuizQuestion,
  getEstadoQuizEstudiante,
  submitQuiz,
} from "../../services/quizService";

const QuizEstudiantePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del juego
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [correctas, setCorrectas] = useState(0);

  // Saber si el estudiante ya completó este quiz
  const [yaCompletado, setYaCompletado] = useState(false);
  const [scoreGuardado, setScoreGuardado] = useState<number | null>(null);

  // Cargar quiz desde backend
  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      try {
        setError(null);
        const data = await getQuizById(id);
        setQuiz(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el quiz.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  // Preguntar al backend si YA completó este quiz
  useEffect(() => {
    if (!id) return;

    const cargarEstado = async () => {
      try {
        const estado = await getEstadoQuizEstudiante(id);
        if (estado.status === "completado") {
          setYaCompletado(true);
          setScoreGuardado(estado.score);
        }
      } catch (err) {
        console.error("Error obteniendo estado del quiz:", err);
      }
    };

    cargarEstado();
  }, [id]);

  const manejarRespuesta = (opcionIndex: number) => {
    if (!quiz) return;

    setRespuesta(opcionIndex);

    const pregunta = quiz.preguntas[indice];
    const esCorrecta = opcionIndex === pregunta.indiceCorrecta;
    if (esCorrecta) {
      setCorrectas((prev) => prev + 1);
    }

    // pasar a la siguiente después de 1.2s
    setTimeout(async () => {
      setRespuesta(null);

      if (indice + 1 < quiz.preguntas.length) {
        setIndice((prev) => prev + 1);
      } else {
        // Última pregunta
        const totalPreguntas = quiz.preguntas.length;
        const correctasFinal = correctas + (esCorrecta ? 1 : 0);

        const puntajeSobreDiez = Math.round(
          (correctasFinal / totalPreguntas) * 10
        );

        try {
          await submitQuiz(quiz._id, {
            courseId: (quiz.curso as string) || "",
            score: puntajeSobreDiez,
          });
        } catch (err) {
          console.error("Error guardando progreso del quiz:", err);
        }

        navigate("/estudiante/resultado-quiz", {
          state: {
            total: totalPreguntas,
            correctas: correctasFinal,
            puntaje: puntajeSobreDiez,
            titulo: quiz.titulo,
            cursoId: quiz.curso as string | undefined,
          },
        });
      }
    }, 1200);
  };

  if (cargando) {
    return <div style={centro}>Cargando quiz...</div>;
  }

  if (error || !quiz) {
    return (
      <div style={centro}>
        <p style={{ color: "#f87171", marginBottom: 6 }}>
          {error || "Quiz no encontrado."}
        </p>
        <button style={btn} onClick={() => navigate("/estudiante")}>
          Volver
        </button>
      </div>
    );
  }

  // Si ya estaba completado, no dejamos volver a jugar
  if (yaCompletado) {
    const cursoId = quiz.curso as string | undefined;

    return (
      <div style={centro}>
        <h2 style={{ marginBottom: 8 }}>Ya completaste este quiz 👏</h2>
        {scoreGuardado != null && (
          <p style={{ marginBottom: 12 }}>
            Tu puntaje registrado: <strong>{scoreGuardado}/10</strong>
          </p>
        )}
        <button
          style={btn}
          onClick={() => {
            if (cursoId) {
              navigate(`/estudiante/curso/${cursoId}`);
            } else {
              navigate("/estudiante");
            }
          }}
        >
          ← Volver al curso
        </button>
      </div>
    );
  }

  const preguntaActual: QuizQuestion = quiz.preguntas[indice];

  const totalPreguntas = quiz.preguntas.length;
  const progreso = ((indice + 1) / totalPreguntas) * 100;

  return (
    <div style={pantalla}>
      <div style={contenedor}>
        {/* CABECERA */}
        <div style={topRow}>
          <div>
            <p style={quizLabel}>Quiz</p>
            <h1 style={titulo}>{quiz.titulo}</h1>
          </div>

          <div style={topRight}>
            <div style={pill}>
              Pregunta {indice + 1} de {totalPreguntas}
            </div>
            <div style={pillSecondary}>
              Correctas: {correctas}/{totalPreguntas}
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={barraProgreso}>
          <div
            style={{
              ...barraInterior,
              width: `${progreso}%`,
            }}
          />
        </div>

        {/* PREGUNTA */}
        <div style={cardPregunta}>
          <h2 style={pregunta}>{preguntaActual.enunciado}</h2>
        </div>

        {/* OPCIONES */}
        <div style={opcionesContainer}>
          {preguntaActual.opciones.map((op, i) => {
            const seleccionado = respuesta === i;
            const esCorrecto = i === preguntaActual.indiceCorrecta;

            const colorFinal =
              respuesta === null
                ? "#1f2937"
                : seleccionado
                ? esCorrecto
                  ? "#16a34a"
                  : "#dc2626"
                : "#1f2937";

            return (
              <button
                key={i}
                onClick={() => manejarRespuesta(i)}
                disabled={respuesta !== null}
                style={{
                  ...opcionBtn,
                  backgroundColor: colorFinal,
                  boxShadow:
                    respuesta === null && !seleccionado
                      ? "0 10px 25px rgba(15,23,42,0.6)"
                      : "0 0 0 rgba(0,0,0,0)",
                  transform:
                    respuesta === null && seleccionado ? "scale(0.98)" : "none",
                }}
              >
                <span style={opcionIndex}>{String.fromCharCode(65 + i)}</span>
                <span>{op}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ======== ESTILOS ======== */

const pantalla: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #1d243b 0, #020617 45%, #020617 100%)",
  color: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  fontFamily: "system-ui, sans-serif",
};

const contenedor: CSSProperties = {
  width: "100%",
  maxWidth: 820,
  backgroundColor: "rgba(15,23,42,0.96)",
  padding: "24px 26px 26px",
  borderRadius: 24,
  boxShadow: "0 28px 80px rgba(0,0,0,0.75)",
};

const topRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 14,
};

const quizLabel: CSSProperties = {
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "#9ca3af",
  marginBottom: 2,
};

const titulo: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  margin: 0,
};

const topRight: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 6,
};

const pill: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background:
    "linear-gradient(135deg,rgba(96,165,250,0.25),rgba(129,140,248,0.35))",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const pillSecondary: CSSProperties = {
  padding: "5px 12px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.7)",
  fontSize: "0.8rem",
};

const barraProgreso: CSSProperties = {
  width: "100%",
  height: 8,
  backgroundColor: "#1f2933",
  borderRadius: 999,
  marginBottom: 18,
  overflow: "hidden",
};

const barraInterior: CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)",
};

const cardPregunta: CSSProperties = {
  background: "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,64,175,0.5))",
  borderRadius: 18,
  padding: "16px 18px",
  marginBottom: 18,
  border: "1px solid rgba(129,140,248,0.5)",
};

const pregunta: CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 600,
  margin: 0,
};

const opcionesContainer: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};

const opcionBtn: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(55,65,81,0.8)",
  fontSize: "0.98rem",
  cursor: "pointer",
  color: "#f1f5f9",
  transition: "background-color 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease",
  display: "flex",
  gap: 10,
  textAlign: "left",
};

const opcionIndex: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.7)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.8rem",
  fontWeight: 700,
  backgroundColor: "rgba(15,23,42,0.9)",
};

const centro: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "system-ui",
};

const btn: CSSProperties = {
  padding: "8px 14px",
  fontSize: "0.9rem",
  borderRadius: 999,
  border: "1px solid #ddd",
  cursor: "pointer",
};

export default QuizEstudiantePage;
