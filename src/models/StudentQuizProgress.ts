// src/models/StudentQuizProgress.ts
import { Schema, model, Document } from "mongoose";

export interface IStudentQuizProgress extends Document {
  user: Schema.Types.ObjectId;
  quiz: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  status: "pendiente" | "completado";
  score?: number;
  finishedAt?: Date;
}

const studentQuizProgressSchema = new Schema<IStudentQuizProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    status: {
      type: String,
      enum: ["pendiente", "completado"],
      default: "pendiente",
    },

    score: { type: Number },
    finishedAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IStudentQuizProgress>(
  "StudentQuizProgress",
  studentQuizProgressSchema
);
