import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Curso } from "../../services/courseService";
import { getCursoDocenteById } from "../../services/docenteCourseService";
import {
  type Quiz,
  getQuizzesByCurso,
  crearQuiz,
  actualizarQuiz,
  eliminarQuiz,
  publicarQuiz, // 👈 NUEVO
} from "../../services/quizService";
import { useAuth } from "../../context/useAuth";

const CursoDocenteDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [cargandoCurso, setCargandoCurso] = useState(true);
  const [errorCurso, setErrorCurso] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [cargandoQuizzes, setCargandoQuizzes] = useState(true);
  const [errorQuizzes, setErrorQuizzes] = useState<string | null>(null);

  // Crear quiz manual
  const [nuevoTituloQuiz, setNuevoTituloQuiz] = useState("");
  const [creandoQuiz, setCreandoQuiz] = useState(false);

  // Editar quiz (solo título)
  const [quizEditando, setQuizEditando] = useState<Quiz | null>(null);
  const [tituloEditQuiz, setTituloEditQuiz] = useState("");
  const [guardandoQuiz, setGuardandoQuiz] = useState(false);

  // Publicar quiz
  const [publicandoId, setPublicandoId] = useState<string | null>(null);

  const totalQuizzes = quizzes.length;

  // ================== LOGOUT ==================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ================== CARGAR CURSO ==================
  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setErrorCurso(null);
        const data = await getCursoDocenteById(id);
        setCurso(data);
      } catch (err) {
        console.error(err);
        setErrorCurso("No se pudo cargar la información del curso.");
      } finally {
        setCargandoCurso(false);
      }
    };
    cargar();
  }, [id]);

  // ================== CARGAR QUIZZES ==================
  useEffect(() => {
    const cargarQuizzes = async () => {
      if (!id) return;
      try {
        setErrorQuizzes(null);
        const data = await getQuizzesByCurso(id);
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        setErrorQuizzes("No se pudieron cargar los quizzes de este curso.");
      } finally {
        setCargandoQuizzes(false);
      }
    };
    cargarQuizzes();
  }, [id]);

  // ================== CREAR QUIZ MANUAL ==================
  const handleCrearQuiz = async () => {
    if (!curso || !id) return;
    if (!nuevoTituloQuiz.trim()) {
      alert("El título del quiz es obligatorio.");
      return;
    }

    try {
      setCreandoQuiz(true);
      const creado = await crearQuiz({
        titulo: nuevoTituloQuiz.trim(),
        curso: id,
      });

      setQuizzes((prev) => [creado, ...prev]);

      // opcional: sincronizar contador del curso
      setCurso((prev) =>
        prev ? { ...prev, totalQuizzes: (prev.totalQuizzes ?? 0) + 1 } : prev
      );

      setNuevoTituloQuiz("");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el quiz.");
    } finally {
      setCreandoQuiz(false);
    }
  };

  // ================== IR A SUBIR DOCUMENTO (IA) ==================
  const handleIrASubirDocumento = () => {
    if (!id) return;
    navigate(`/docente/cursos/${id}/subir-documento`);
  };

  // ================== EDITAR QUIZ (TÍTULO) ==================
  const abrirModalEditarQuiz = (quiz: Quiz) => {
    setQuizEditando(quiz);
    setTituloEditQuiz(quiz.titulo);
  };

  const cerrarModalEditarQuiz = () => {
    setQuizEditando(null);
    setTituloEditQuiz("");
    setGuardandoQuiz(false);
  };

  const handleGuardarQuiz = async () => {
    if (!quizEditando) return;
    if (!tituloEditQuiz.trim()) {
      alert("El título del quiz es obligatorio.");
      return;
    }

    try {
      setGuardandoQuiz(true);
      const actualizado = await actualizarQuiz(quizEditando._id, {
        titulo: tituloEditQuiz.trim(),
      });

      setQuizzes((prev) =>
        prev.map((q) => (q._id === actualizado._id ? actualizado : q))
      );
      cerrarModalEditarQuiz();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el quiz.");
      setGuardandoQuiz(false);
    }
  };

  // ================== ELIMINAR QUIZ ==================
  const handleEliminarQuiz = async (quiz: Quiz) => {
    if (!confirm(`¿Seguro que deseas eliminar el quiz "${quiz.titulo}"?`)) {
      return;
    }

    try {
      await eliminarQuiz(quiz._id);
      setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));

      // sincronizar contador del curso
      setCurso((prev) =>
        prev
          ? { ...prev, totalQuizzes: Math.max((prev.totalQuizzes ?? 1) - 1, 0) }
          : prev
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el quiz.");
    }
  };

  // ================== PUBLICAR QUIZ (GENERAR CÓDIGO) ==================
  const handlePublicarQuiz = async (quiz: Quiz) => {
    try {
      setPublicandoId(quiz._id);
      const actualizado = await publicarQuiz(quiz._id);

      setQuizzes((prev) =>
        prev.map((q) => (q._id === actualizado._id ? actualizado : q))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo publicar el quiz.");
    } finally {
      setPublicandoId(null);
    }
  };

  // ================== ESTADOS GENERALES ==================
  if (cargandoCurso) {
    return <div style={layoutCenterDark}>Cargando curso...</div>;
  }

  if (errorCurso || !curso) {
    return (
      <div style={layoutCenterDark}>
        <p style={{ color: "#fecaca", marginBottom: 12 }}>
          {errorCurso || "Curso no encontrado."}
        </p>
        <button
          style={btnSecondaryDark}
          onClick={() => navigate("/docente/cursos")}
        >
          Volver a mis cursos
        </button>
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
            maxWidth: 1100,
            margin: "0 auto",
            padding: "10px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate("/docente/cursos")}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "transparent",
                fontSize: "0.8rem",
                cursor: "pointer",
                color: "#e5e7eb",
              }}
            >
              ← Mis cursos
            </button>
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
                NeuroLearn · Curso
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#f9fafb",
                }}
              >
                {curso.nombre}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              Panel docente
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
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 28px 40px",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: 4,
                color: "#f9fafb",
              }}
            >
              {curso.nombre}
            </h1>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.95rem",
                margin: 0,
              }}
            >
              {curso.descripcion || "Este curso aún no tiene descripción."}
            </p>
          </div>

          <div
            style={{
              textAlign: "right",
              fontSize: "0.85rem",
              color: "#9ca3af",
            }}
          >
            <div>
              <strong>Estado:</strong>{" "}
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  backgroundColor:
                    curso.estado === "Activo"
                      ? "rgba(22,163,74,0.12)"
                      : "rgba(148,163,184,0.18)",
                  color: curso.estado === "Activo" ? "#4ade80" : "#e5e7eb",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  border:
                    curso.estado === "Activo"
                      ? "1px solid rgba(34,197,94,0.5)"
                      : "1px solid rgba(148,163,184,0.5)",
                }}
              >
                {curso.estado}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ marginRight: 12 }}>
                <strong>Estudiantes:</strong> {curso.totalEstudiantes ?? 0}
              </span>
              <span>
                <strong>Quizzes:</strong> {totalQuizzes}
              </span>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.3fr)",
            gap: 18,
          }}
        >
          {/* IZQUIERDA: quizzes */}
          <article
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,1), rgba(15,23,42,0.96))",
              borderRadius: 20,
              padding: "18px 20px 16px",
              boxShadow: "0 18px 46px rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: 8,
                color: "#f9fafb",
              }}
            >
              Quizzes del curso
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9ca3af",
                marginBottom: 12,
              }}
            >
              Crea y administra los quizzes que tus estudiantes responderán
              en este curso.
            </p>

            {/* CREAR QUIZ MANUAL */}
            <div
              style={{
                marginBottom: 16,
                padding: "10px 12px",
                borderRadius: 14,
                backgroundColor: "#020617",
                border: "1px solid rgba(148,163,184,0.5)",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.85rem",
                  color: "#e5e7eb",
                  fontWeight: 500,
                }}
              >
                Crear nuevo quiz manual
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  placeholder="Título del quiz"
                  value={nuevoTituloQuiz}
                  onChange={(e) => setNuevoTituloQuiz(e.target.value)}
                  style={{
                    ...inputRounded,
                    backgroundColor: "#020617",
                    color: "#f9fafb",
                    border: "1px solid #4b5563",
                  }}
                />

                <button
                  onClick={handleCrearQuiz}
                  disabled={creandoQuiz}
                  style={btnPrimaryDark}
                >
                  {creandoQuiz ? "Creando..." : "Crear quiz"}
                </button>
              </div>
            </div>

            {/* LISTA DE QUIZZES */}
            {cargandoQuizzes ? (
              <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                Cargando quizzes...
              </p>
            ) : errorQuizzes ? (
              <p style={{ fontSize: "0.9rem", color: "#fecaca" }}>
                {errorQuizzes}
              </p>
            ) : quizzes.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                Aún no has creado quizzes para este curso.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {quizzes.map((quiz) => (
                  <QuizItem
                    key={quiz._id}
                    quiz={quiz}
                    onEditarTitulo={() => abrirModalEditarQuiz(quiz)}
                    onEditarPreguntas={() =>
                      navigate(`/docente/quizzes/${quiz._id}/editar`)
                    }
                    onEliminar={() => handleEliminarQuiz(quiz)}
                    onPublicar={
                      quiz.estado === "Borrador"
                        ? () => handlePublicarQuiz(quiz)
                        : undefined
                    }
                    publicando={publicandoId === quiz._id}
                  />
                ))}
              </div>
            )}
          </article>

          {/* DERECHA: Resumen + IA */}
          <aside
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,1), rgba(15,23,42,0.96))",
              borderRadius: 20,
              padding: "16px 18px 14px",
              boxShadow: "0 18px 46px rgba(15,23,42,0.9)",
              fontSize: "0.9rem",
              color: "#e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <h3
              style={{
                fontSize: "0.98rem",
                fontWeight: 600,
                color: "#f9fafb",
                margin: 0,
              }}
            >
              Herramientas del curso
            </h3>
            <p style={{ margin: 0, color: "#9ca3af" }}>
              Administra el contenido del curso y aprovecha la IA para generar
              cuestionarios a partir de tus documentos.
            </p>

            <div
              style={{
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 14,
                backgroundColor: "#020617",
                border: "1px solid rgba(148,163,184,0.5)",
              }}
            >
              <p style={{ margin: "0 0 4px" }}>
                <strong>Estudiantes inscritos:</strong>{" "}
                {curso.totalEstudiantes ?? 0}
              </p>
              <p style={{ margin: "0 0 4px" }}>
                <strong>Quizzes creados:</strong> {totalQuizzes}
              </p>
            </div>

            {/* BOTÓN IA */}
            <div
              style={{
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,rgba(129,140,248,0.15),rgba(236,72,153,0.1))",
                border: "1px dashed rgba(129,140,248,0.5)",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.85rem",
                  color: "#e5e7eb",
                  fontWeight: 500,
                }}
              >
                Generar cuestionario con IA
              </p>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.8rem",
                  color: "#d1d5db",
                }}
              >
                Sube un PDF, DOCX o TXT y NeuroLearn AI creará un quiz
                automáticamente con preguntas tipo Kahoot.
              </p>

              <button
               onClick={handleIrASubirDocumento}
               style={{
               width: "100%",
               padding: "9px 16px",
               borderRadius: 999,
               border: "none",
               backgroundColor: "#4f46e5",       // 👈 morado fijo, más calmado
               fontSize: "0.88rem",
               cursor: "pointer",
               color: "#ffffff",
               fontWeight: 600,
               boxShadow: "0 6px 16px rgba(15,23,42,0.6)", // o simplemente bórralo
              }}
           >

                📤 Subir documento y generar quiz
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => navigate("/docente/cursos")}
                style={btnSecondaryDark}
              >
                Volver a mis cursos
              </button>
            </div>
          </aside>
        </section>
      </main>

      {/* MODAL EDITAR QUIZ */}
      {quizEditando && (
        <ModalEditarQuiz
          titulo={tituloEditQuiz}
          setTitulo={setTituloEditQuiz}
          onClose={cerrarModalEditarQuiz}
          onSave={handleGuardarQuiz}
          guardando={guardandoQuiz}
        />
      )}
    </div>
  );
};

const layoutCenterDark: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, sans-serif",
  color: "#e5e7eb",
};

const btnSecondaryDark: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.5)",
  backgroundColor: "transparent",
  fontSize: "0.85rem",
  cursor: "pointer",
  color: "#e5e7eb",
};

const btnPrimaryDark: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  fontSize: "0.85rem",
  cursor: "pointer",
  color: "#ffffff",
  fontWeight: 600,
  whiteSpace: "nowrap",
  boxShadow: "0 14px 30px rgba(79,70,229,0.8)",
};

const inputRounded: CSSProperties = {
  flex: "1 1 220px",
  minWidth: 180,
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  outline: "none",
};

/* ============= ITEM QUIZ ============= */

const QuizItem = ({
  quiz,
  onEditarTitulo,
  onEditarPreguntas,
  onEliminar,
  onPublicar,
  publicando,
}: {
  quiz: Quiz;
  onEditarTitulo: () => void;
  onEditarPreguntas: () => void;
  onEliminar: () => void;
  onPublicar?: () => void;
  publicando?: boolean;
}) => {
  const estadoColor =
    quiz.estado === "Publicado"
      ? { bg: "rgba(22,163,74,0.12)", text: "#4ade80" }
      : { bg: "rgba(148,163,184,0.18)", text: "#e5e7eb" };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.5)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#020617",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#f9fafb",
          }}
        >
          {quiz.titulo}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "0.8rem",
            color: "#9ca3af",
          }}
        >
          Preguntas: {quiz.preguntas?.length ?? 0}
        </p>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.78rem",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              backgroundColor: estadoColor.bg,
              color: estadoColor.text,
              fontWeight: 600,
            }}
          >
            {quiz.estado}
          </span>
          {quiz.estado === "Publicado" && quiz.codigoAcceso && (
            <span style={{ color: "#e5e7eb" }}>
              Código: <strong>{quiz.codigoAcceso}</strong>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {onPublicar && quiz.estado === "Borrador" && (
          <button
            onClick={onPublicar}
            disabled={publicando}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#e0f2fe",
              fontSize: "0.8rem",
              cursor: "pointer",
              color: "#0369a1",
              fontWeight: 600,
              opacity: publicando ? 0.7 : 1,
            }}
          >
            {publicando ? "Publicando..." : "Publicar y generar código"}
          </button>
        )}
        <button
          onClick={onEditarPreguntas}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
            fontSize: "0.8rem",
            cursor: "pointer",
            color: "#ffffff",
          }}
        >
          Editar preguntas
        </button>
        <button
          onClick={onEditarTitulo}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            backgroundColor: "transparent",
            fontSize: "0.8rem",
            cursor: "pointer",
            color: "#e5e7eb",
          }}
        >
          Renombrar
        </button>
        <button
          onClick={onEliminar}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "none",
            backgroundColor: "#fee2e2",
            fontSize: "0.8rem",
            cursor: "pointer",
            color: "#b91c1c",
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

/* ============= MODAL EDITAR QUIZ ============= */

const ModalEditarQuiz = ({
  titulo,
  setTitulo,
  onClose,
  onSave,
  guardando,
}: {
  titulo: string;
  setTitulo: (v: string) => void;
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
    zIndex: 50,
  };

  const modal: CSSProperties = {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: "18px 20px 16px",
    width: "100%",
    maxWidth: 420,
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

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            marginBottom: 6,
            color: "#f9fafb",
          }}
        >
          Editar quiz
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: "#9ca3af",
            marginBottom: 12,
          }}
        >
          Ajusta el título del quiz.
        </p>

        <div style={{ marginBottom: 6 }}>
          <label style={label}>Título</label>
          <input
            style={input}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
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

export default CursoDocenteDetallePage;
