// src/pages/estudiante/ResultadoQuizPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";

const ResultadoQuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const total = location.state?.total || 0;
  const correctas = location.state?.correctas || 0;
  const puntaje = location.state?.puntaje as number | undefined;
  const titulo = location.state?.titulo as string | undefined;
  const cursoId = location.state?.cursoId as string | undefined;

  const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

  const mensaje =
    porcentaje === 100
      ? "¡Perfecto! 🌟 Lo hiciste increíble"
      : porcentaje >= 80
      ? "¡Excelente trabajo! 🔥"
      : porcentaje >= 60
      ? "¡Muy bien! Puedes mejorar aún más 💪"
      : porcentaje >= 40
      ? "Ánimo, sigue practicando ✨"
      : "No te rindas, tú puedes 💜";

  return (
    <div style={layout}>
      <div style={card}>
        <h1 style={tituloEstilo}>Resultado del Quiz</h1>

        {titulo && (
          <p style={subTituloEstilo}>
            <strong>{titulo}</strong>
          </p>
        )}

        <p style={mensajeTexto}>{mensaje}</p>

        <div style={resultadoBox}>
          <p style={datoTexto}>
            <strong>Correctas:</strong> {correctas} / {total}
          </p>

          <p style={datoTexto}>
            <strong>Porcentaje:</strong> {porcentaje}%
          </p>

          {puntaje != null && (
            <p style={datoTexto}>
              <strong>Puntaje registrado:</strong> {puntaje}/10
            </p>
          )}
        </div>

        <button
          onClick={() => {
            if (cursoId) {
              navigate(`/estudiante/curso/${cursoId}`);
            } else {
              navigate("/estudiante");
            }
          }}
          style={boton}
        >
          Volver al curso
        </button>
      </div>
    </div>
  );
};

/* ====== ESTILOS ====== */

const layout: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top, #1f2937 0, #020617 55%, #020617 100%)",
  padding: 16,
  fontFamily: "system-ui, sans-serif",
};

const card: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  backgroundColor: "rgba(15,23,42,0.94)",
  padding: "26px 26px",
  borderRadius: 20,
  color: "#e5e7eb",
  textAlign: "center",
  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
};

const tituloEstilo: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 800,
  marginBottom: 6,
  color: "#f8fafc",
};

const subTituloEstilo: CSSProperties = {
  fontSize: "0.95rem",
  marginBottom: 12,
  color: "#cbd5e1",
};

const mensajeTexto: CSSProperties = {
  fontSize: "1rem",
  marginBottom: 20,
  color: "#cbd5e1",
};

const resultadoBox: CSSProperties = {
  backgroundColor: "rgba(30,41,59,0.7)",
  padding: "16px 10px",
  borderRadius: 12,
  marginBottom: 22,
};

const datoTexto: CSSProperties = {
  fontSize: "1rem",
  margin: 6,
};

const boton: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  color: "#fff",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
};

export default ResultadoQuizPage;
