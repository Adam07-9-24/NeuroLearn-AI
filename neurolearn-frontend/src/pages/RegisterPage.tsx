import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setCargando(true);

    try {
      await registerUser(nombre, email, password);

      setExito("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg =
        axiosError.response?.data?.message ??
        "Error al registrarse. Intenta nuevamente.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        background:
          "radial-gradient(circle at top, #1d4ed8 0, #020617 45%, #020617 100%)",
        color: "#e5e7eb",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px", // 🔹 ahora es responsive, no fijo
          padding: "28px",
          borderRadius: "18px",
          backgroundColor: "rgba(15,23,42,0.92)",
          border: "1px solid rgba(148,163,184,0.3)",
          boxShadow:
            "0 20px 50px rgba(15,23,42,0.8), 0 0 0 1px rgba(15,23,42,1)",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontWeight: 700,
            fontSize: "1.4rem",
          }}
        >
          Crear cuenta
        </h2>

        <p
          style={{
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "0.9rem",
            color: "#9ca3af",
          }}
        >
          Regístrate para acceder como estudiante.
        </p>

        {error && (
          <div
            style={{
              color: "#fecaca",
              backgroundColor: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.4)",
              fontSize: "0.85rem",
              padding: "8px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            {error}
          </div>
        )}

        {exito && (
          <div
            style={{
              color: "#bbf7d0",
              backgroundColor: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.4)",
              fontSize: "0.85rem",
              padding: "8px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            {exito}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "0.85rem",
              }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                boxSizing: "border-box", // 🔹 evita que se salga
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "0.85rem",
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
                border: "1px solid #475569",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "0.85rem",
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
                border: "1px solid #475569",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              marginTop: "6px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: cargando ? "#15803d" : "#16a34a",
              color: "white",
              cursor: cargando ? "default" : "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              width: "100%",
            }}
          >
            {cargando ? "Creando cuenta..." : "Registrarse"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              marginTop: "4px",
              padding: "9px",
              borderRadius: "8px",
              border: "1px solid #475569",
              backgroundColor: "#0f172a",
              color: "#60a5fa",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Ya tengo cuenta
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
