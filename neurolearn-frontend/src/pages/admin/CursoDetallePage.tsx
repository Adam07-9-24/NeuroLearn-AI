import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminTopBar from "../../components/admin/AdminTopBar";
import { getCursoById, type Curso } from "../../services/courseService";

const CursoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setError(null);
        const data = await getCursoById(id); // 👈 nombre correcto
        setCurso(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el curso.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

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
        Cargando curso...
      </div>
    );
  }

  if (error || !curso) {
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
        {error ?? "Curso no encontrado."}
      </div>
    );
  }

  const fecha = curso.creadoEn
    ? new Date(curso.creadoEn).toLocaleDateString("es-PE")
    : "—";

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
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 32px 40px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 16,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ← Volver
        </button>

        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: "22px 24px",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          }}
        >
          <h1
            style={{
              fontSize: "1.6rem",
              marginBottom: 4,
              color: "#0f172a",
            }}
          >
            {curso.nombre}
          </h1>

          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
            Docente: <strong>{curso.docenteNombre || "Sin asignar"}</strong>
          </p>

          <p
            style={{
              marginTop: 12,
              fontSize: "0.95rem",
              color: "#4b5563",
            }}
          >
            {curso.descripcion || "Sin descripción."}
          </p>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              fontSize: "0.9rem",
              color: "#374151",
            }}
          >
            <span>
              <strong>Estado:</strong> {curso.estado}
            </span>
            <span>
              <strong>Estudiantes:</strong>{" "}
              {curso.totalEstudiantes ?? "—"}
            </span>
            <span>
              <strong>Quizzes:</strong>{" "}
              {curso.totalQuizzes ?? "—"}
            </span>
            <span>
              <strong>Creado:</strong> {fecha}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CursoDetallePage;
