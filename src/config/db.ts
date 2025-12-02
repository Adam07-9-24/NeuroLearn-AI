import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("🟢 Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB", error);
    process.exit(1);
  }
};
