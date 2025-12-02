import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { getDashboardStats } from "../../services/adminService";
import type { DashboardStats } from "../../services/adminService";
import AdminTopBar from "../../components/admin/AdminTopBar";

const cardBaseStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  padding: "18px 20px",
  boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
  minHeight: 150,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error cargando stats:", err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setCargando(false);
      }
    };

    cargarStats();
  }, []);

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
        Cargando dashboard...
      </div>
    );
  }

  if (error || !stats) {
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
        {error ?? "No se pudieron cargar las estadísticas."}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Barra superior del panel admin */}
      <AdminTopBar />

      {/* Contenido principal */}
      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 32px",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#0f172a",
            }}
          >
            Dashboard del Administrador
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Bienvenido de vuelta, gestiona tu plataforma educativa.
          </p>
        </header>

        {/* Tarjetas superiores tipo Figma */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "26px",
          }}
        >
          {/* Total usuarios */}
          <StatCard
            title="Total usuarios"
            value={stats.totalUsuarios}
            icon="👥"
            iconBg="linear-gradient(135deg,#0ea5e9,#3b82f6)"
          />

          {/* Usuarios activos */}
          <StatCard
            title="Usuarios activos"
            value={stats.activos}
            icon="✅"
            iconBg="linear-gradient(135deg,#22c55e,#16a34a)"
          />

          {/* Usuarios bloqueados */}
          <StatCard
            title="Usuarios bloqueados"
            value={stats.bloqueados}
            icon="🚫"
            iconBg="linear-gradient(135deg,#f97373,#ef4444)"
          />

          {/* Cursos activos */}
          <StatCard
            title="Cursos activos"
            value={stats.cursosActivos}
            icon="📘"
            iconBg="linear-gradient(135deg,#a855f7,#6366f1)"
          />

          {/* Quizzes creados */}
          <StatCard
            title="Quizzes creados"
            value={stats.quizzesCreados}
            icon="📝"
            iconBg="linear-gradient(135deg,#22c55e,#16a34a)"
          />

          {/* Distribución de roles (misma estética) */}
          <RolesCard
            admins={stats.roles.admins}
            docentes={stats.roles.docentes}
            estudiantes={stats.roles.estudiantes}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

/* ─────────────────────────────
   Tarjeta de estadística simple
   ───────────────────────────── */

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
}

const StatCard = ({ title, value, icon, iconBg }: StatCardProps) => {
  return (
    <div style={cardBaseStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        {/* Icono en recuadro de color */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 22,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",

          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: "1.9rem",
            fontWeight: 700,
            margin: 0,
            color: "#0f172a",
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: "6px 0 0 0",
            fontSize: "0.9rem",
            color: "#6b7280",
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   Tarjeta de distribución de roles
   ───────────────────────────── */

interface RolesCardProps {
  admins: number;
  docentes: number;
  estudiantes: number;
}

const RolesCard = ({ admins, docentes, estudiantes }: RolesCardProps) => {
  return (
    <div style={cardBaseStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              margin: 0,
            }}
          >
            Distribución de roles
          </p>
        </div>

        {/* iconito gráfico */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            background: "linear-gradient(135deg,#f97316,#facc15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 22,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          📊
        </div>
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          color: "#111827",
          display: "grid",
          rowGap: 4,
        }}
      >
        <span>
          <strong>Admins:</strong> {admins}
        </span>
        <span>
          <strong>Docentes:</strong> {docentes}
        </span>
        <span>
          <strong>Estudiantes:</strong> {estudiantes}
        </span>
      </div>
    </div>
  );
};
