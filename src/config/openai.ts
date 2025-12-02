import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ Falta la variable OPENAI_API_KEY en el .env");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
