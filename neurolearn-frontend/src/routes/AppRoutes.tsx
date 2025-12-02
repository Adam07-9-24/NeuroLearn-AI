import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// Dashboards
import AdminDashboard from "../pages/admin/AdminDashboard";
import DocenteDashboard from "../pages/docente/DocenteDashboard";
import EstudianteDashboard from "../pages/estudiante/EstudianteDashboard";

// Admin
import UsuariosAdminPage from "../pages/admin/UsuariosAdminPage";
import CursosAdminPage from "../pages/admin/CursosAdminPage";
import CursoDetallePage from "../pages/admin/CursoDetallePage";

// Docente – Cursos
import CursosDocentePage from "../pages/docente/CursosDocentePage";
import CursoDocenteDetallePage from "../pages/docente/CursoDocenteDetallePage";
import SubirDocumentoPage from "../pages/docente/SubirDocumentoPage";
import QuizEditarPage from "../pages/docente/QuizEditarPage";

import IngresarQuizPage from "../pages/estudiante/IngresarQuizPage";
import QuizEstudiantePage from "../pages/estudiante/QuizEstudiantePage";
import ResultadoQuizPage from "../pages/estudiante/ResultadoQuizPage";
import MiCursoDetallePage from "../pages/estudiante/MiCursoDetallePage";





const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz redirige al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/usuarios" element={<UsuariosAdminPage />} />
      <Route path="/admin/cursos" element={<CursosAdminPage />} />
      <Route path="/admin/cursos/:id" element={<CursoDetallePage />} />
      <Route path="/admin/estadisticas" element={<AdminDashboard />} />

      {/* ================= DOCENTE ================= */}

      {/* Dashboard inicial del docente */}
      <Route path="/docente" element={<DocenteDashboard />} />
      

      {/* Gestión de cursos del docente */}
      <Route path="/docente/cursos" element={<CursosDocentePage />} />
      <Route path="/docente/cursos/:id" element={<CursoDocenteDetallePage />} />
      <Route path="/docente/cursos/:id/subir-documento"element={<SubirDocumentoPage />}/>
      <Route path="/docente/quizzes/:id/editar" element={<QuizEditarPage />} />

      {/* ================= ESTUDIANTE ================= */}
      <Route path="/estudiante" element={<EstudianteDashboard />} />
      <Route path="/estudiante/ingresar-quiz"element={<IngresarQuizPage />}/>
      <Route path="/estudiante/quizzes/:id" element={<QuizEstudiantePage />}/>
      <Route path="/estudiante/resultado" element={<ResultadoQuizPage />}/>
      <Route path="/estudiante/curso/:id" element={<MiCursoDetallePage />} />
      <Route path="/estudiante/resultado-quiz" element={<ResultadoQuizPage />} />



      


      

      {/* Cualquier ruta desconocida redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
