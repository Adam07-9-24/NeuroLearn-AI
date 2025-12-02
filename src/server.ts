import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 8000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

start();
