import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: "ADMIN" | "DOCENTE" | "ESTUDIANTE";
  estado: "Activo" | "Bloqueado";
  fechaRegistro: Date;
}

const UserSchema = new Schema<IUser>({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: ["ADMIN", "DOCENTE", "ESTUDIANTE"],
    default: "ESTUDIANTE",
  },
  estado: {
    type: String,
    enum: ["Activo", "Bloqueado"],
    default: "Activo",
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
