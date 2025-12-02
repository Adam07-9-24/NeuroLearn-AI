import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type Quiz,
  type QuizQuestion,
  getQuizById,
  actualizarQuiz,
} from "../../services/quizService";

const QuizEditarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [titulo, setTitulo] = useState("");
  const [preguntas, setPreguntas] = useState<QuizQuestion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Cargar quiz
  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setCargando(true);
        setError(null);
        const data = await getQuizById(id);
        setQuiz(data);
        setTitulo(data.titulo);
        setPreguntas(
          data.preguntas && data.preguntas.length > 0
            ? data.preguntas
            : [
                {
                  enunciado: "",
                  opciones: ["", "", "", ""],
                  indiceCorrecta: 0,
                },
              ]
        );
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el quiz.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  // Handlers de edición
  const actualizarEnunciado = (idx: number, valor: string) => {
    setPreguntas((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, enunciado: valor } : p
      )
    );
  };

  const actualizarOpcion = (
    idxPregunta: number,
    idxOpcion: number,
    valor: string
  ) => {
    setPreguntas((prev) =>
      prev.map((p, i) => {
        if (i !== idxPregunta) return p;
        const nuevas = [...(p.opciones ?? [])];
        while (nuevas.length < 4) nuevas.push("");
        nuevas[idxOpcion] = valor;
        return { ...p, opciones: nuevas };
      })
    );
  };

  const cambiarCorrecta = (idxPregunta: number, idxCorrecta: number) => {
    setPreguntas((prev) =>
      prev.map((p, i) =>
        i === idxPregunta ? { ...p, indiceCorrecta: idxCorrecta } : p
      )
    );
  };

  const agregarPregunta = () => {
    setPreguntas((prev) => [
      ...prev,
      {
        enunciado: "",
        opciones: ["", "", "", ""],
        indiceCorrecta: 0,
      },
    ]);
  };

  const eliminarPregunta = (idx: number) => {
    setPreguntas((prev) => prev.filter((_, i) => i !== idx));
  };

  const validarPreguntas = () => {
    if (preguntas.length === 0) {
      setError("El quiz debe tener al menos 1 pregunta.");
      return false;
    }

    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (!p.enunciado || !p.enunciado.trim()) {
        setError(`La pregunta ${i + 1} no tiene enunciado.`);
        return false;
      }
      const opciones = (p.opciones ?? []).map((o) => o.trim());
      if (opciones.length < 2 || opciones.filter((o) => o).length < 2) {
        setError(`La pregunta ${i + 1} debe tener al menos 2 opciones.`);
        return false;
      }
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!quiz || !id) return;

    if (!titulo.trim()) {
      setError("El título del quiz es obligatorio.");
      return;
    }

    if (!validarPreguntas()) return;

    try {
      setGuardando(true);
      setError(null);
      setInfo("Guardando cambios...");

      const normalizadas: QuizQuestion[] = preguntas.map((p) => ({
        enunciado: p.enunciado.trim(),
        opciones: (p.opciones ?? []).map((o) => o.trim()),
        indiceCorrecta:
          typeof p.indiceCorrecta === "number"
            ? p.indiceCorrecta
            : Number(p.indiceCorrecta) || 0,
      }));

      const actualizado = await actualizarQuiz(id, {
        titulo: titulo.trim(),
        preguntas: normalizadas,
      });

      setQuiz(actualizado);
      setInfo("Quiz actualizado correctamente.");

      // Volver al curso
      if (actualizado.curso) {
        setTimeout(() => {
          navigate(`/docente/cursos/${actualizado.curso}`);
        }, 900);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el quiz. Intenta nuevamente.");
      setInfo(null);
    } finally {
      setGuardando(false);
    }
  };

  // UI estados
  if (cargando) {
    return (
      <div style={layoutCenter}>
        Cargando quiz...
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div style={layoutCenter}>
        <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>
        <button
          style={btnSecondary}
          onClick={() => navigate("/docente/cursos")}
        >
          Volver a mis cursos
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={layoutCenter}>
        <p style={{ color: "#b91c1c", marginBottom: 12 }}>
          Quiz no encontrado.
        </p>
        <button
          style={btnSecondary}
          onClick={() => navigate("/docente/cursos")}
        >
          Volver a mis cursos
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#eef2ff,#fdf2ff)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <main style={mainLayout}>
        {/* HEADER */}
        <header style={header}>
          <button
            style={btnGhost}
            onClick={() =>
              navigate(
                quiz.curso
                  ? `/docente/cursos/${quiz.curso}`
                  : "/docente/cursos"
              )
            }
          >
            ← Volver al curso
          </button>

          <div style={{ textAlign: "right" }}>
            <p style={headerTitle}>Editar quiz</p>
            <p style={headerSubtitle}>
              Ajusta el título y las preguntas del cuestionario.
            </p>
          </div>
        </header>

        {/* CARD PRINCIPAL */}
        <section style={gridLayout}>
          <article style={card}>
            <h1 style={title}>Título del quiz</h1>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={inputTitle}
              placeholder="Ej: Quiz sobre la saga de Majin Buu"
            />

            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <p style={subtitle}>
                Preguntas ({preguntas.length})
              </p>
              <p style={hint}>
                Puedes editar el enunciado, las opciones y
                marcar la respuesta correcta.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {preguntas.map((p, idx) => (
                <PreguntaCard
                  key={idx}
                  index={idx}
                  pregunta={p}
                  onChangeEnunciado={(val) =>
                    actualizarEnunciado(idx, val)
                  }
                  onChangeOpcion={(idxOpt, val) =>
                    actualizarOpcion(idx, idxOpt, val)
                  }
                  onChangeCorrecta={(idxOpt) =>
                    cambiarCorrecta(idx, idxOpt)
                  }
                  onEliminar={() => eliminarPregunta(idx)}
                />
              ))}
            </div>

            <button
              style={btnAdd}
              type="button"
              onClick={agregarPregunta}
            >
              + Agregar pregunta
            </button>

            {error && (
              <p
                style={{
                  color: "#b91c1c",
                  fontSize: "0.85rem",
                  marginTop: 8,
                }}
              >
                {error}
              </p>
            )}
            {info && (
              <p
                style={{
                  color: "#4b5563",
                  fontSize: "0.85rem",
                  marginTop: 4,
                }}
              >
                {info}
              </p>
            )}

            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                style={btnSecondary}
                type="button"
                disabled={guardando}
                onClick={() =>
                  navigate(
                    quiz.curso
                      ? `/docente/cursos/${quiz.curso}`
                      : "/docente/cursos"
                  )
                }
              >
                Cancelar
              </button>
              <button
                style={btnPrimary}
                type="button"
                disabled={guardando}
                onClick={handleGuardar}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

/* === Componente de una pregunta === */

const PreguntaCard = ({
  index,
  pregunta,
  onChangeEnunciado,
  onChangeOpcion,
  onChangeCorrecta,
  onEliminar,
}: {
  index: number;
  pregunta: QuizQuestion;
  onChangeEnunciado: (v: string) => void;
  onChangeOpcion: (idx: number, v: string) => void;
  onChangeCorrecta: (idx: number) => void;
  onEliminar: () => void;
}) => {
  const opciones = (pregunta.opciones ?? []).slice(0, 4);
  while (opciones.length < 4) opciones.push("");

  return (
    <div style={preguntaCard}>
      <div style={preguntaHeader}>
        <span style={badgePregunta}>Pregunta {index + 1}</span>
        <button
          type="button"
          onClick={onEliminar}
          style={btnDeleteSmall}
        >
          Eliminar
        </button>
      </div>

      <textarea
        value={pregunta.enunciado}
        onChange={(e) => onChangeEnunciado(e.target.value)}
        style={textarea}
        placeholder="Escribe el enunciado de la pregunta..."
      />

      <div style={opcionesGrid}>
        {opciones.map((op, idx) => (
          <label key={idx} style={opcionItem}>
            <input
              type="radio"
              name={`preg-${index}`}
              checked={pregunta.indiceCorrecta === idx}
              onChange={() => onChangeCorrecta(idx)}
              style={{ marginRight: 6 }}
            />
            <input
              type="text"
              value={op}
              onChange={(e) => onChangeOpcion(idx, e.target.value)}
              style={inputOpcion}
              placeholder={`Opción ${idx + 1}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

/* === ESTILOS === */

const layoutCenter: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, sans-serif",
};

const mainLayout: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "24px 24px 40px",
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const headerTitle: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#111827",
  margin: 0,
};

const headerSubtitle: CSSProperties = {
  fontSize: "0.9rem",
  color: "#6b7280",
  margin: 0,
};

const btnGhost: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  fontSize: "0.85rem",
  cursor: "pointer",
  color: "#4b5563",
};

const gridLayout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
};

const card: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 18,
  padding: "18px 20px 18px",
  boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
};

const title: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  margin: 0,
  marginBottom: 8,
  color: "#0f172a",
};

const subtitle: CSSProperties = {
  fontSize: "0.9rem",
  color: "#111827",
  margin: 0,
};

const hint: CSSProperties = {
  fontSize: "0.82rem",
  color: "#6b7280",
  margin: 0,
};

const inputTitle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  outline: "none",
  marginTop: 10,
};

const btnPrimary: CSSProperties = {
  padding: "8px 18px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  fontSize: "0.88rem",
  cursor: "pointer",
  color: "#ffffff",
  fontWeight: 600,
};

const btnSecondary: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  fontSize: "0.85rem",
  cursor: "pointer",
  color: "#4b5563",
};

const btnAdd: CSSProperties = {
  marginTop: 12,
  padding: "7px 14px",
  borderRadius: 999,
  border: "1px dashed #a5b4fc",
  backgroundColor: "#eef2ff",
  fontSize: "0.85rem",
  cursor: "pointer",
  color: "#4f46e5",
  fontWeight: 500,
};

const preguntaCard: CSSProperties = {
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  padding: "10px 12px",
  backgroundColor: "#f9fafb",
};

const preguntaHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
};

const badgePregunta: CSSProperties = {
  fontSize: "0.78rem",
  padding: "3px 8px",
  borderRadius: 999,
  backgroundColor: "#eef2ff",
  color: "#4f46e5",
  fontWeight: 600,
};

const btnDeleteSmall: CSSProperties = {
  padding: "4px 10px",
  borderRadius: 999,
  border: "none",
  backgroundColor: "#fee2e2",
  fontSize: "0.78rem",
  cursor: "pointer",
  color: "#b91c1c",
};

const textarea: CSSProperties = {
  width: "100%",
  minHeight: 60,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  padding: "7px 9px",
  fontSize: "0.9rem",
  resize: "vertical",
  outline: "none",
  marginBottom: 8,
};

const opcionesGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 8,
};

const opcionItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "5px 8px",
  borderRadius: 999,
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
};

const inputOpcion: CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "0.85rem",
  backgroundColor: "transparent",
};

export default QuizEditarPage;
