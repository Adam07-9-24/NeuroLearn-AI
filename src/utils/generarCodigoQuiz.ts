// src/utils/generarCodigoQuiz.ts
import Quiz from "../models/Quiz";

/**
 * Genera un código de 6 dígitos (tipo Kahoot) y asegura que no se repita
 * en la colección de quizzes.
 */
export const generarCodigoQuiz = async (): Promise<string> => {
  while (true) {
    // Genera un número aleatorio entre 100000 y 999999
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Verifica si ya existe un quiz con ese código
    const existe = await Quiz.findOne({ codigoAcceso: codigo }).lean();

    // Si no existe, retornamos este código
    if (!existe) {
      return codigo;
    }

    // Si existe, el while sigue y genera otro
  }
};
