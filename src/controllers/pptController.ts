import { Response } from "express";
import {
  generarPptDesdeContenido,
  type PptContenido,
  type PptEstilo as PptEstiloIA,
} from "../utils/pptGenerator";
import { AuthRequest } from "../middleware/authMiddleware";

// ===== Tipos que VIENEN del frontend =====

interface FrontPptSeccion {
  titulo: string;
  bullets: string[];
}

interface FrontPptEstilo {
  modo: "automatico" | "manual";
  fuente: string;
  conclusiones: boolean;
  slides?: number;
}

/**
 * Mapea el estilo que manda el frontend
 * (modo, fuente, conclusiones, slides)
 * al estilo que usa internamente el generador IA
 * (tema, colorPrincipal, fuenteTitulo, fuenteTexto, maxSlides).
 */
function mapearEstilo(front?: FrontPptEstilo): PptEstiloIA {
  if (!front) {
    return {
      tema: "oscuro",
      colorPrincipal: "#4F46E5",
      fuenteTitulo: "Poppins",
      fuenteTexto: "Inter",
      maxSlides: 7,
    };
  }

  return {
    // si luego quieres, puedes usar front.modo para cambiar tema
    tema: "oscuro",
    colorPrincipal: "#4F46E5",
    fuenteTitulo: front.fuente || "Poppins",
    fuenteTexto: front.fuente || "Inter",
    maxSlides: front.slides ?? 7,
  };
}

export const generarPptHandler = async (req: AuthRequest, res: Response) => {
  try {
    const {
      tituloPresentacion,
      secciones,
      estilo,
    }: {
      tituloPresentacion: string;
      secciones: FrontPptSeccion[];
      estilo?: FrontPptEstilo;
    } = req.body;

    // Validación básica
    if (!tituloPresentacion || !secciones || !Array.isArray(secciones)) {
      return res.status(400).json({
        message: "Faltan datos: tituloPresentacion o secciones.",
      });
    }

    if (secciones.length === 0) {
      return res.status(400).json({
        message: "Debe haber al menos una sección para generar el PPT.",
      });
    }

    // 1) Convertir secciones -> textoOriginal para la IA
    //    (juntamos títulos + bullets en un solo texto largo)
    const textoOriginal = secciones
      .map((sec) => {
        const bulletsLimpios = (sec.bullets || [])
          .map((b) => String(b ?? "").trim())
          .filter((b) => b.length > 0);

        return `${sec.titulo}:\n${bulletsLimpios
          .map((b) => `- ${b}`)
          .join("\n")}`;
      })
      .join("\n\n");

    const contenido: PptContenido = {
      tituloPresentacion,
      textoOriginal,
    };

    // 2) Adaptar estilo frontend -> estilo IA
    const estiloIA = mapearEstilo(estilo);

    // 3) Generar PPT con IA + pptxgenjs
    const buffer = await generarPptDesdeContenido(contenido, estiloIA);

    const fileName =
      `${tituloPresentacion || "presentacion"}`
        .replace(/[/\\?%*:|"<>]/g, "_") + ".pptx";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.send(buffer);
  } catch (error) {
    console.error("Error generando PPT:", error);
    console.error("Body recibido en /api/ppt/generar:", req.body);

    return res.status(500).json({
      message: "Error al generar el PPT.",
    });
  }
};
