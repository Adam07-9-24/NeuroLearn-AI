// src/models/Quiz.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizQuestion {
  enunciado: string;                
  opciones: string[];               
  indiceCorrecta: number;          
  tiempoSegundos?: number;         
  puntos?: number;                 
}

export interface IQuiz extends Document {
  titulo: string;
  curso?: Types.ObjectId;
  preguntas: IQuizQuestion[];       
  estado: "Borrador" | "Publicado";
  creadoEn: Date;
  codigoAcceso?: string;            
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  enunciado: { type: String, required: true },
  opciones: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => arr.length >= 2,
      message: "La pregunta debe tener al menos 2 opciones.",
    },
  },
  indiceCorrecta: { type: Number, required: true },
  tiempoSegundos: { type: Number, default: 30 },
  puntos: { type: Number, default: 1000 },
});

const QuizSchema = new Schema<IQuiz>({
  titulo: { type: String, required: true },
  curso: { type: Schema.Types.ObjectId, ref: "Course" },
  preguntas: {
    type: [QuizQuestionSchema],
    default: [],
  },
  estado: {
    type: String,
    enum: ["Borrador", "Publicado"],
    default: "Borrador",
  },
  codigoAcceso: {                    
    type: String,
    unique: true,
    sparse: true,                    
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
