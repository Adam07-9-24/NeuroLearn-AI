import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import courseRoutes from "./routes/courseRoutes";
import quizRoutes from "./routes/quizRoutes";
import docenteCourseRoutes from "./routes/docenteCourseRoutes";
import documentRoutes from "./routes/documentRoutes"; 
import studentCourseRoutes from "./routes/studentCourseRoutes"; 
import pptRoutes from "./routes/pptRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "NeuroLearn API funcionando 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cursos", courseRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/docente/cursos", docenteCourseRoutes);
app.use("/api/documentos", documentRoutes); 
app.use("/api/cursos-estudiante", studentCourseRoutes); 
app.use("/api/ppt", pptRoutes);


export default app;
