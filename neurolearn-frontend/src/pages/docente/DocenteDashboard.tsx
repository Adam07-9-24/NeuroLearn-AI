import { useNavigate } from "react-router-dom";

const DocenteDashboard = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f2933 0, #020617 40%, #020617 100%)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          borderRadius: 28,
          border: "1px solid rgba(148,163,184,0.35)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
          boxShadow:
            "0 24px 60px rgba(15,23,42,0.75), 0 0 0 1px rgba(15,23,42,0.5)",
          padding: "26px 28px 26px 26px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1.2fr)",
          gap: 20,
        }}
      >
        {/* Columna izquierda: título + descripción */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 11px",
              borderRadius: 999,
              backgroundColor: "rgba(56,189,248,0.12)",
              border: "1px solid rgba(56,189,248,0.35)",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 12, color: "#7dd3fc" }}>Docente</span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "999px",
                backgroundColor: "#22c55e",
              }}
            />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              Panel activo
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: "1.9rem",
                margin: 0,
                marginBottom: 6,
                color: "#f9fafb",
                letterSpacing: "-0.03em",
              }}
            >
              Panel del Docente
            </h1>
            <p
              style={{
                margin: 0,
                marginBottom: 10,
                color: "#9ca3af",
                fontSize: "0.94rem",
                maxWidth: 420,
              }}
            >
              Gestiona tus cursos, crea quizzes con IA y genera materiales
              listos para tus clases desde un solo lugar.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              onClick={() => navigate("/docente/cursos")}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(79,70,229,0.55)",
                transition:
                  "transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 16px 40px rgba(79,70,229,0.7)";
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(1.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 12px 30px rgba(79,70,229,0.55)";
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(1)";
              }}
            >
              Ver mis cursos
            </button>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#9ca3af",
              }}
            >
              <span style={{ fontSize: 16 }}>💡</span>
              <span>Empieza desde un curso y sube tu primer documento.</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: “tarjetas” de resumen */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: "14px 14px 13px",
              background:
                "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.94))",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: "#6b7280",
              }}
            >
              Cursos
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#e5e7eb",
              }}
            >
              ️📚
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 11.5,
                color: "#9ca3af",
              }}
            >
              Revisa y administra las clases que ya tienes asignadas.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "14px 14px 13px",
              background:
                "linear-gradient(135deg, rgba(30,64,175,1), rgba(76,29,149,1))",
              border: "1px solid rgba(129,140,248,0.7)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: "#e5e7eb",
              }}
            >
              Quizzes con IA
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#f9fafb",
              }}
            >
              ⚡
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 11.5,
                color: "#e5e7eb",
              }}
            >
              Genera evaluaciones automáticas desde tus documentos.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "14px 14px 13px",
              background:
                "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.94))",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: "#6b7280",
              }}
            >
              Presentaciones
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#e5e7eb",
              }}
            >
              🎞️
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 11.5,
                color: "#9ca3af",
              }}
            >
              Crea PPT profesionales listos para usar en clase.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "14px 14px 13px",
              background:
                "linear-gradient(135deg, rgba(15,23,42,1), rgba(15,23,42,0.94))",
              border: "1px dashed rgba(148,163,184,0.6)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: 6,
                fontSize: 11.5,
                color: "#9ca3af",
              }}
            >
              Próximamente: analíticas de estudiantes, progreso y más.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              NeuroLearn seguirá aprendiendo contigo. 🧠
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
