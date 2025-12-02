// src/components/admin/AdminTopBar.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const AdminTopBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasShadow, setHasShadow] = useState(false);

  // 🔽 Sombra suave al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 4);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menu = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "home" },
    { path: "/admin/usuarios", label: "Usuarios", icon: "users" },
    { path: "/admin/cursos", label: "Cursos", icon: "book" },
  ];

  /** 🎨 Íconos suaves */
  const icon = (name: string) => {
    const style: CSSProperties = { fontSize: 18, color: "#4b5563" };

    switch (name) {
      case "home":
        return <span style={style}>🏠</span>;
      case "users":
        return <span style={style}>👥</span>;
      case "book":
        return <span style={style}>📘</span>;
     
    }
  };

  const handleLogout = () => {
    // limpia sesión (contexto / storage)
    logout();
    // y te manda al login
    navigate("/login");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: hasShadow ? "0 8px 18px rgba(15,23,42,0.06)" : "none",
        transition: "box-shadow 0.18s ease, background-color 0.18s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* LEFT: Logo + texto */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              // 🎨 degradado suave
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            🎓
          </div>

          <div>
            <h2
              style={{
                fontSize: "1.05rem",
                margin: 0,
                color: "#111827",
                fontWeight: 700,
              }}
            >
              NeuroLearn AI
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.78rem",
                color: "#6b7280",
              }}
            >
              Panel de Administración
            </p>
          </div>
        </div>

        {/* CENTER: Menú */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {menu.map((item) => {
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: "0.93rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#111827" : "#4b5563",
                  backgroundColor: active ? "#f1f5f9" : "transparent",
                  transition: "0.18s ease",
                }}
              >
                {icon(item.icon)}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Usuario + salir */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ textAlign: "right", lineHeight: 1.1 }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#111827", // siempre visible
              }}
            >
              {user?.nombre ?? "Usuario Demo"}
            </p>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              {user?.rol ?? "ADMIN"}
            </span>
          </div>

          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#a855f7,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {(user?.nombre ?? "U").charAt(0).toUpperCase()}
          </div>

          {/* Botón salir */}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              border: "1px solid #f97373",
              background: "transparent",
              borderRadius: 999,
              color: "#f97373",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition:
                "background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease",
            }}
          >
            ↩ Salir
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
