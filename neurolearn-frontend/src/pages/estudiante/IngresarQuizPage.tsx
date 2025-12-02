// src/pages/estudiante/IngresarQuizPage.tsx
import { useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  getQuizByCodigo,
  getEstadoQuizEstudiante,
} from "../../services/quizService";

const IngresarQuizPage = () => {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const limpio = codigo.trim();
    if (!limpio) {
      setError("Ingresa un código válido.");
      return;
    }

    try {
      setCargando(true);

      // 1) Buscar el quiz por código: GET /api/quizzes/join/:codigo
      const quiz = await getQuizByCodigo(limpio);

      // 2) Verificar si el estudiante ya lo completó
      const estado = await getEstadoQuizEstudiante(quiz._id);

      if (estado.status === "completado") {
        // Ya lo hizo → NO lo dejamos entrar de nuevo
        const puntajeTexto =
          estado.score != null ? ` Tu puntaje fue ${estado.score}/10.` : "";
        setError(
          "Ya completaste este quiz. No puedes resolverlo otra vez." +
            puntajeTexto
        );
        return;
      }

      // 3) Si está pendiente, ahora sí vamos a la página del quiz
      navigate(`/estudiante/quizzes/${quiz._id}`);
    } catch (err) {
      console.error(err);
      setError("No se encontró un quiz con ese código.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={layout}>
      <div style={card}>
        <h1 style={title}>Unirme a un quiz</h1>
        <p style={subtitle}>
          Ingresa el código que te compartió tu docente para acceder al quiz
          en NeuroLearn.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej: 482913"
            style={input}
          />

          {error && <p style={errorText}>{error}</p>}

          <button type="submit" style={button} disabled={cargando}>
            {cargando ? "Buscando quiz..." : "Ingresar al quiz"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/estudiante")}
          style={backButton}
        >
          ← Volver a mi panel
        </button>
      </div>
    </div>
  );
};

/* ====== ESTILOS ====== */

const layout: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #1f2937 0, #020617 45%, #020617 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  fontFamily: "system-ui, sans-serif",
};

const card: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  backgroundColor: "rgba(15,23,42,0.94)",
  borderRadius: 18,
  padding: "22px 20px 18px",
  boxShadow: "0 24px 80px rgba(15,23,42,0.9)",
  color: "#e5e7eb",
};

const title: CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 700,
  marginBottom: 6,
};

const subtitle: CSSProperties = {
  fontSize: "0.9rem",
  color: "#9ca3af",
  marginBottom: 16,
};

const input: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid #4b5563",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontSize: "1rem",
  textAlign: "center",
  marginBottom: 8,
  outline: "none",
};

const button: CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
  marginTop: 4,
};

const backButton: CSSProperties = {
  marginTop: 10,
  width: "100%",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #4b5563",
  backgroundColor: "transparent",
  color: "#e5e7eb",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const errorText: CSSProperties = {
  fontSize: "0.8rem",
  color: "#fca5a5",
  marginBottom: 4,
};

export default IngresarQuizPage;
