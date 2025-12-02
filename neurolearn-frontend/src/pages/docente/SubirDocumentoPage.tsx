import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  extraerTextoDocumento,
  generarPpt,
} from "../../services/documentService";

import { generarQuizDesdeTexto } from "../../services/quizService";
import { getCursoDocenteById } from "../../services/docenteCourseService";
import type { Curso } from "../../services/courseService";
import "../../styles/buttons.css";


// ============================
// Tipo estricto para PPT
// ============================
type EstiloEnviar = {
  modo: "automatico" | "manual";
  fuente: string;
  conclusiones: boolean;
  slides?: number;
};

const SubirDocumentoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso | null>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [texto, setTexto] = useState("");
  const [tituloQuiz, setTituloQuiz] = useState("");
  const [numPreguntas, setNumPreguntas] = useState<number | "">("");
  const [cargandoTexto, setCargandoTexto] = useState(false);
  const [generandoQuiz, setGenerandoQuiz] = useState(false);
  const [pptCargando, setPptCargando] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // PPT CONFIG
  const [pptModo, setPptModo] = useState<"automatico" | "manual">("automatico");
  const [pptSlidesManual, setPptSlidesManual] = useState<number | "">("");
  const [pptFuente, setPptFuente] = useState("Poppins");
  const [pptConclusiones, setPptConclusiones] = useState<"si" | "no">("si");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ============================
  // Cargar Curso
  // ============================
  useEffect(() => {
    const cargar = async () => {
      if (!id) return;

      try {
        const data = await getCursoDocenteById(id);
        setCurso(data);
        setTituloQuiz(`Quiz de ${data.nombre}`);
      } catch (e) {
        console.error(e);
      }
    };

    cargar();
  }, [id]);

  // ============================
  // File handler
  // ============================
  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    setTexto("");
    setError(null);
    setInfo(null);
  };

  const abrirSelectorArchivos = () => fileInputRef.current?.click();

  // ============================
  // Extraer texto
  // ============================
  const handleExtraerTexto = async () => {
    if (!archivo) {
      setError("Primero selecciona un archivo.");
      return;
    }

    try {
      setCargandoTexto(true);
      setError(null);
      setInfo("Procesando documento…");

      const data = await extraerTextoDocumento(archivo);
      setTexto(data.texto);

      setInfo("Texto extraído correctamente. Ya puedes generar QUIZ o PPT.");
    } catch (e) {
      console.error(e);
      setError("Error procesando el documento.");
    } finally {
      setCargandoTexto(false);
    }
  };

  // ============================
  // Generar Quiz
  // ============================
  const handleGenerarQuiz = async () => {
    if (!texto.trim()) {
      setError("Primero extrae el texto.");
      return;
    }

    if (!tituloQuiz.trim()) {
      setError("El título del quiz es obligatorio.");
      return;
    }

    const cantidad = numPreguntas === "" ? 5 : Number(numPreguntas);

    try {
      setGenerandoQuiz(true);
      setInfo("Generando preguntas con IA…");

      await generarQuizDesdeTexto({
        titulo: tituloQuiz,
        cursoId: id!,
        texto,
        numPreguntas: cantidad,
      });

      setInfo("Quiz creado correctamente.");
      setTimeout(() => navigate(`/docente/cursos/${id}`), 1200);
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el quiz.");
    } finally {
      setGenerandoQuiz(false);
    }
  };

  // ============================
  // Generar PPT
  // ============================
  const handleGenerarPpt = async () => {
    if (!texto.trim()) {
      setError("Primero extrae el texto.");
      return;
    }

    const estiloEnviar: EstiloEnviar = {
      modo: pptModo,
      fuente: pptFuente,
      conclusiones: pptConclusiones === "si",
    };

    if (pptModo === "manual") {
      if (!pptSlidesManual || pptSlidesManual <= 0) {
        setError("Ingresa un número de diapositivas válido.");
        return;
      }
      estiloEnviar.slides = pptSlidesManual;
    }

    try {
      setPptCargando(true);
      setError(null);
      setInfo("Generando presentación con IA…");

      const seccionesParaBackend = [
        {
          titulo: "Contenido procesado",
          bullets: texto.split(/\n+/).slice(0, 12),
        },
      ];

      const blob = await generarPpt({
        tituloPresentacion: tituloQuiz || curso?.nombre || "Presentación",
        secciones: seccionesParaBackend,
        estilo: estiloEnviar,
      });

      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tituloQuiz || "presentacion"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);

      setInfo("PPT generado exitosamente.");
    } catch (e) {
      console.error(e);
      setError("Error generando PPT.");
    } finally {
      setPptCargando(false);
    }
  };

  // ==============================================================
  // UI
  // ==============================================================

  return (
    <div style={pageContainer}>
      <main style={mainLayout}>
        {/* HEADER */}
        <header style={header}>
          <button
         className="btn-ghost"
         onClick={() => navigate(id ? `/docente/cursos/${id}` : "/docente/cursos")}>
          ← Volver
         </button>


          <div style={{ textAlign: "right" }}>
            <p style={headerTitle}>Subir Documento</p>
            <p style={headerSubtitle}>
              {curso ? curso.nombre : "Crea contenido para tus clases"}
            </p>
          </div>
        </header>

        {/* GRID */}
        <section style={contentGrid}>
          {/* -------------------------------- IZQUIERDA -------------------------------- */}
          <article style={card}>
            <h2 style={cardTitle}>Sube tu documento</h2>
            <p style={cardText}>Arrastra tu archivo aquí o haz clic para seleccionarlo.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={handleArchivoChange}
            />

            <div style={dropZone} onClick={abrirSelectorArchivos}>
              <div style={dropIcon}>📄</div>
              <p style={dropFilename}>
                {archivo ? archivo.name : "Seleccionar archivo…"}
              </p>
              <p style={dropFormats}>Formatos: PDF · DOCX · TXT</p>
            </div>

            <button
              style={btnPrimary}
              onClick={handleExtraerTexto}
              disabled={!archivo || cargandoTexto}
            >
              {cargandoTexto ? "Procesando…" : "Extraer texto"}
            </button>

            {error && <p style={errorText}>{error}</p>}
            {info && <p style={infoText}>{info}</p>}
          </article>

          {/* -------------------------------- DERECHA -------------------------------- */}
          <aside style={rightColumn}>
            {/* QUIZ */}
            <div style={card}>
              <h3 style={cardTitle}>Generar Quiz</h3>

              <label style={label}>Título del quiz</label>
              <input
                style={inputRounded}
                value={tituloQuiz}
                onChange={(e) => setTituloQuiz(e.target.value)}
              />

              <label style={label}>Número de preguntas</label>
              <input
                type="number"
                min={1}
                value={numPreguntas}
                onChange={(e) =>
                  setNumPreguntas(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                style={{ ...inputRounded, maxWidth: 120 }}
              />

              <button
                style={btnPurple}
                disabled={!texto || generandoQuiz}
                onClick={handleGenerarQuiz}
              >
                {generandoQuiz ? "Generando…" : "Generar Quiz con IA"}
              </button>

              {/* Divider */}
              <div style={dividerRow}>
                <span style={dividerLine}></span>
                <span style={dividerLabel}>o generar PPT</span>
                <span style={dividerLine}></span>
              </div>

              {/* PPT */}
              <h3 style={cardTitle}>Modo de presentación</h3>

              <label style={pptLabel}>
                <input
                  type="radio"
                  checked={pptModo === "automatico"}
                  onChange={() => setPptModo("automatico")}
                />{" "}
                Automático (IA optimiza todo)
              </label>

              <label style={pptLabel}>
                <input
                  type="radio"
                  checked={pptModo === "manual"}
                  onChange={() => setPptModo("manual")}
                />{" "}
                Manual
              </label>

              {pptModo === "manual" && (
                <>
                  <label style={pptLabel}>Número de diapositivas</label>
                  <input
                    type="number"
                    min={1}
                    value={pptSlidesManual}
                    onChange={(e) =>
                      setPptSlidesManual(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    style={{ ...inputRounded, maxWidth: 120 }}
                  />

                  <label style={pptLabel}>Fuente</label>
                  <select
                    style={inputRounded}
                    value={pptFuente}
                    onChange={(e) => setPptFuente(e.target.value)}
                  >
                    <option value="Poppins">Poppins</option>
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                  </select>

                  <label style={pptLabel}>Incluir conclusiones</label>
                  <select
                    style={inputRounded}
                    value={pptConclusiones}
                    onChange={(e) =>
                      setPptConclusiones(e.target.value as "si" | "no")
                    }
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </>
              )}

              <button
                style={btnGreen}
                disabled={!texto || pptCargando}
                onClick={handleGenerarPpt}
              >
                {pptCargando ? "Generando…" : "Generar PPT"}
              </button>
            </div>

            {/* VISTA PREVIA */}
            <div style={card}>
              <h3 style={cardTitle}>Vista previa del texto</h3>

              {texto ? (
                <pre style={preText}>{texto}</pre>
              ) : (
                <p style={cardText}>Aún no se ha extraído texto.</p>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

// =================================================================
// ESTILOS — DARK MATE PREMIUM (APPLE-STYLE)
// =================================================================

const pageContainer: CSSProperties = {
  minHeight: "100vh",
  background: "#0d0d0f",
  color: "#ffffff",
  fontFamily: "Inter, system-ui, sans-serif",
};

const mainLayout: CSSProperties = {
  maxWidth: 1300,
  margin: "0 auto",
  padding: "32px",
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 32,
};

const headerTitle: CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 700,
  margin: 0,
  color: "#ffffff",
};

const headerSubtitle: CSSProperties = {
  fontSize: "0.95rem",
  color: "#b5b5b5",
  margin: 0,
};


const contentGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1.6fr",
  gap: 24,
};

const card: CSSProperties = {
  backgroundColor: "#1a1a1d",
  borderRadius: 18,
  padding: "22px 26px",
  boxShadow: "0 0 30px rgba(0,0,0,0.25)",
  border: "1px solid #2a2a2d",
};

const cardTitle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#ffffff",
};

const cardText: CSSProperties = {
  fontSize: "0.9rem",
  color: "#b5b5b5",
  marginTop: 4,
};

const dropZone: CSSProperties = {
  border: "2px dashed #343438",
  borderRadius: 16,
  padding: "36px 12px",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: "#141416",
  transition: "0.2s",
  marginTop: 12,
};

const dropIcon: CSSProperties = {
  fontSize: "2.6rem",
  marginBottom: 10,
};

const dropFilename: CSSProperties = {
  fontSize: "0.9rem",
  color: "#e5e5e5",
};

const dropFormats: CSSProperties = {
  fontSize: "0.75rem",
  color: "#8d8d8d",
  marginTop: 4,
};

const inputRounded: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #2a2a2d",
  backgroundColor: "#0f0f11",
  color: "#ffffff",
  outline: "none",
  fontSize: "0.85rem",
  marginBottom: 12,
};

const btnPrimary: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 999,
  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: 12,
};

const btnPurple: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 999,
  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: 12,
};

const btnGreen: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 999,
  background: "linear-gradient(135deg,#16a34a,#15803d)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: 14,
};

const rightColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const label: CSSProperties = {
  color: "#b5b5b5",
  fontSize: "0.82rem",
  marginBottom: 4,
};

const pptLabel: CSSProperties = {
  color: "#d4d4d4",
  fontSize: "0.82rem",
  marginBottom: 6,
  marginTop: 12,
};

const dividerRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  margin: "20px 0",
};

const dividerLine: CSSProperties = {
  flex: 1,
  height: 1,
  backgroundColor: "#2a2a2d",
};

const dividerLabel: CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b6b6b",
};

const preText: CSSProperties = {
  whiteSpace: "pre-wrap",
  fontSize: "0.85rem",
  color: "#d4d4d4",
  maxHeight: 260,
  overflowY: "auto",
};

const errorText: CSSProperties = {
  color: "#ef4444",
  fontSize: "0.85rem",
  marginTop: 8,
};

const infoText: CSSProperties = {
  color: "#6cb9ff",
  fontSize: "0.85rem",
  marginTop: 8,
};

export default SubirDocumentoPage;