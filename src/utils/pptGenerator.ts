import PptxGenJS from "pptxgenjs";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export interface PptEstilo {
  tema?: "claro" | "oscuro";
  colorPrincipal?: string;
  fuenteTitulo?: string;
  fuenteTexto?: string;
  maxSlides?: number;
}

export interface PptContenido {
  tituloPresentacion: string;
  textoOriginal: string;
}

function limpiarTextoPpt(texto: string, maxLen = 300): string {
  if (!texto) return "";

  let limpio = texto.replace(/[^\x09\x0A\x0D\x20-\uFFFF]/g, "");

  limpio = limpio.trim();

  if (limpio.length > maxLen) {
    limpio = limpio.slice(0, maxLen) + "…";
  }

  return limpio;
}

async function generarEstructuraIA(
  titulo: string,
  texto: string,
  maxSlides?: number
): Promise<{ titulo: string; bullets: string[] }[]> {
  const userPrompt = `
Genera la estructura de una presentación profesional en PowerPoint
basada en el siguiente texto (hasta 9000 caracteres recortado automáticamente):

---
TÍTULO: ${titulo}

TEXTO BASE:
"""
${texto.slice(0, 9000)}
"""
---

REQUISITOS ESTRICTOS:
- Devuelve SOLO un JSON válido.
- Cada diapositiva contiene:
    { "titulo": "...", "bullets": ["idea 1", "idea 2", ...] }
- Máximo ${maxSlides ?? 7} diapositivas.
- Cada bullet debe ser claro y profesional.
- Nada de explicaciones fuera del JSON.
  `.trim();

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: userPrompt,
  });

  const raw = completion.output_text;
  console.log("RAW IA PPT ===>");
  console.log(raw);

  let cleaned = raw.trim();
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (firstBracket === -1 || lastBracket === -1) {
    throw new Error("La IA no devolvió un JSON con corchetes [ ].");
  }

  cleaned = cleaned.slice(firstBracket, lastBracket + 1);

  const json = JSON.parse(cleaned);

  if (!Array.isArray(json)) {
    throw new Error("La IA no devolvió un array de secciones.");
  }

  return json;
}

export async function generarPptDesdeContenido(
  contenido: PptContenido,
  estilo: PptEstilo = {}
): Promise<Buffer> {
  const {
    tema = "oscuro",
    colorPrincipal = "#4F46E5",
    fuenteTitulo = "Poppins",
    fuenteTexto = "Inter",
    maxSlides = 7,
  } = estilo;

  const estructuraBruta = await generarEstructuraIA(
    contenido.tituloPresentacion,
    contenido.textoOriginal,
    maxSlides
  );

  
  const estructura = estructuraBruta.slice(0, maxSlides);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";

  const colorFondo = tema === "oscuro" ? "#020617" : "#f8fafc";
  const colorTexto = tema === "oscuro" ? "#e2e8f0" : "#0f172a";

  const portada = pptx.addSlide();
  portada.background = { fill: colorFondo };

 
  portada.addShape(pptx.ShapeType.rect, {
    x: -1,
    y: -1,
    w: 6,
    h: 3.2,
    fill: { color: colorPrincipal },
    rotate: -18,
  });

  portada.addText("NeuroLearn", {
    x: 0.8,
    y: 0.6,
    fontFace: fuenteTitulo,
    fontSize: 20,
    bold: true,
    color: "#ffffff",
  });

  portada.addText(contenido.tituloPresentacion, {
    x: 1,
    y: 1.8,
    w: 8.5,
    fontFace: fuenteTitulo,
    fontSize: 42,
    bold: true,
    color: colorTexto,
  });

  portada.addText("Presentación generada con IA", {
    x: 1,
    y: 3.2,
    w: 7,
    fontFace: fuenteTexto,
    fontSize: 18,
    color: tema === "oscuro" ? "#cbd5e1" : "#475569",
  });

  estructura.forEach((sec, index) => {
    const s = pptx.addSlide();
    s.background = { fill: colorFondo };

    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.45,
      h: "100%",
      fill: { color: colorPrincipal },
    });

    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.7,
      y: 0.45,
      w: 1.1,
      h: 0.55,
      fill: { color: colorPrincipal },
    });

    s.addText(String(index + 1).padStart(2, "0"), {
      x: 0.7,
      y: 0.47,
      w: 1.1,
      h: 0.5,
      align: "center",
      fontFace: fuenteTitulo,
      fontSize: 18,
      bold: true,
      color: "#ffffff",
    });

    const tituloLimpio = limpiarTextoPpt(sec.titulo, 120);

    s.addText(tituloLimpio || `Sección ${index + 1}`, {
      x: 2,
      y: 0.6,
      w: 7.5,
      fontFace: fuenteTitulo,
      fontSize: 30,
      bold: true,
      color: colorTexto,
    });

    const bulletsLimpios = (sec.bullets || [])
      .map((b) => limpiarTextoPpt(String(b ?? "")))
      .filter((b) => b.length > 0)
      .slice(0, 8);

    const bulletsTexto = bulletsLimpios.map((b) => `• ${b}`).join("\n");

    s.addText(bulletsTexto || "Contenido no disponible.", {
      x: 2,
      y: 1.6,
      w: 7.8,
      h: 4.2,
      fontFace: fuenteTexto,
      fontSize: 20,
      color: colorTexto,
      lineSpacing: 28,
    });

   
    s.addText(`Diapositiva ${index + 1}`, {
      x: 8.4,
      y: 6.6,
      fontFace: fuenteTexto,
      fontSize: 10,
      color: "#94a3b8",
    });
  });


  const buffer = (await pptx.write("nodebuffer")) as Buffer;
  return buffer;
}
