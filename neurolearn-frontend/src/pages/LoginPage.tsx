import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/useAuth";

// 🔹 Hook simple para detectar si es móvil
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMobile = useIsMobile(); // 👈 aquí sabemos si es pantalla chica

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await loginUser(email, password);

      // Guardar en contexto + localStorage
      login({
        token: data.token,
        usuario: {
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          rol: data.usuario.rol,
        },
      });

      // 👉 Redirigir según el rol
      switch (data.usuario.rol) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "DOCENTE":
          navigate("/docente");
          break;
        default:
          navigate("/estudiante");
      }
    } catch (err) {
      console.error(err);
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg =
        axiosError.response?.data?.message ??
        "Error al iniciar sesión. Verifica tus credenciales.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: isMobile ? "16px 12px 24px" : "24px 24px",
        background:
          "radial-gradient(circle at top, #1d4ed8 0, #020617 45%, #020617 100%)",
        color: "#e5e7eb",
        overflowX: "hidden",
      }}
    >
      {/* Contenedor central responsive */}
      <div
        style={{
          maxWidth: "1100px",
          width: "100%",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: isMobile ? "center" : "space-between",
          gap: isMobile ? "24px" : "36px",
        }}
      >
        {/* IZQUIERDA */}
        <div
          style={{
            flex: isMobile ? "unset" : 1.15,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(37,99,235,0.35)",
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              alignSelf: isMobile ? "center" : "flex-start",
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "999px",
                backgroundColor: "#22c55e",
              }}
            />
            Plataforma educativa con IA
          </div>

          <h1
            style={{
              fontSize: isMobile ? "2rem" : "2.3rem",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            NeuroLearn
          </h1>

          <p
            style={{
              fontSize: "1.02rem",
              color: "#cbd5f5",
              maxWidth: "460px",
              margin: isMobile ? "0 auto" : "0",
            }}
          >
            Convierte tus documentos en evaluaciones inteligentes para tus
            estudiantes.
          </p>

          <ul
            style={{
              marginTop: "4px",
              fontSize: "0.9rem",
              color: "#9ca3af",
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              maxWidth: "460px",
              marginInline: isMobile ? "auto" : 0,
            }}
          >
            <li>• Pensado para instituciones educativas modernas</li>
          </ul>

          {/* Imagen */}
          <img
            src="/login.png"
            alt="Profesor usando NeuroLearn"
            style={{
              marginTop: "20px",
              maxWidth: isMobile ? "310px" : "430px",
              width: "100%",
              maxHeight: isMobile ? "270px" : "410px",
              objectFit: "contain",
              alignSelf: isMobile ? "center" : "flex-start",
              marginLeft: isMobile ? "0px" : "50px",
              borderRadius: "0px",
              border: "none",
              boxShadow: "none",
            }}
          />
        </div>

        {/* DERECHA (LOGIN) */}
        <div
          style={{
            flex: isMobile ? "unset" : 0.95,
            backgroundColor: "rgba(15,23,42,0.96)",
            borderRadius: "18px",
            border: "1px solid rgba(148,163,184,0.4)",
            boxShadow: "0 20px 40px rgba(15,23,42,0.9)",
            padding: isMobile ? "20px 18px" : "24px 26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: isMobile ? "100%" : "430px",
            marginInline: isMobile ? "auto" : "0",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "13px",
            }}
          >
            <div style={{ marginBottom: "4px" }}>
              <h2
                style={{
                  textAlign: "left",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Inicia sesión
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                }}
              >
                Accede a tu panel de administrador, docente o estudiante.
              </p>
            </div>

            {error && (
              <div
                style={{
                  color: "#fecaca",
                  backgroundColor: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.4)",
                  fontSize: "0.9rem",
                  padding: "9px 10px",
                  borderRadius: "8px",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "0.9rem",
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                marginTop: "6px",
                padding: "11px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: cargando ? "#1d4ed8" : "#2563eb",
                color: "white",
                cursor: cargando ? "default" : "pointer",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "0.9rem",
                color: "#9ca3af",
              }}
            >
              ¿No tienes cuenta?{" "}
              <Link to="/register" style={{ color: "#60a5fa" }}>
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
