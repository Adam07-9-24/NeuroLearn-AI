// src/routes/documentRoutes.ts
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/authMiddleware";


const pdfParse = require("pdf-parse");
// @ts-ignore
const mammoth = require("mammoth");

const router = Router();

// Carpeta temporal
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
});

router.post(
  "/extraer-texto",
  requireAuth,
  upload.single("archivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se envió ningún archivo." });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname.toLowerCase();

      let texto = "";

      // PDF
      if (originalName.endsWith(".pdf")) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        texto = pdfData.text || "";
      }

      // DOCX
      else if (originalName.endsWith(".docx")) {
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        texto = result.value || "";
      }

      // TXT
      else if (originalName.endsWith(".txt")) {
        texto = fs.readFileSync(filePath, "utf8");
      }

      else {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: "Solo se permiten PDF, DOCX o TXT.",
        });
      }

      fs.unlinkSync(filePath);

      if (!texto.trim()) {
        return res.status(400).json({
          message: "No se pudo extraer texto del documento.",
        });
      }

      return res.json({
        texto: texto.slice(0, 15000),
      });

    } catch (error) {
      console.error("Error extrayendo texto:", error);
      return res.status(500).json({
        message: "Error al procesar el documento.",
      });
    }
  }
);

export default router;
