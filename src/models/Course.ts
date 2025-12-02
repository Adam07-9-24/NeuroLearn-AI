// src/models/Course.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICourse extends Document {
  nombre: string;
  descripcion?: string;
  estado: "Activo" | "Inactivo";
  creadoEn: Date;
  docenteNombre?: string;
  totalEstudiantes: number;
  totalQuizzes: number;
  estudiantes: Types.ObjectId[]; 
}

const CourseSchema = new Schema<ICourse>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  estado: {
    type: String,
    enum: ["Activo", "Inactivo"],
    default: "Activo",
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
  docenteNombre: {
    type: String,
    default: "Sin asignar",
  },

  /* 🔥 NUEVO — LISTA DE ESTUDIANTES INSCRITOS */
  estudiantes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],

  // 🔢 Contadores
  totalEstudiantes: {
    type: Number,
    default: 0,
  },
  totalQuizzes: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<ICourse>("Course", CourseSchema);
