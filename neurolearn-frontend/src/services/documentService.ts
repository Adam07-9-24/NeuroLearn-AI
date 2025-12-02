// src/services/documentService.ts
import api from "./api";

export interface ExtraerTextoResponse {
  texto: string;
}

/**
 * Nuevo modelo REAL usado por tu frontend.
 * Esto reemplaza al modelo viejo (tema, colorPrincipal, etc.)
 */
export interface PptEstilo {
  modo: "automatico" | "manual";   // La IA decide o el docente controla
  fuente: string;                  // Poppins / Inter / Arial
  conclusiones: boolean;           // incluir conclusiones
  slides?: number;                 // solo si modo = manual
}

export interface PptSeccion {
  titulo: string;
  bullets: string[];
}

/**
 * Llamar al backend para generar el PPT y devolver un Blob descargable
 */
export const generarPpt = async (payload: {
  tituloPresentacion: string;
  secciones: PptSeccion[];
  estilo?: PptEstilo;
}): Promise<Blob> => {
  const res = await api.post("/ppt/generar", payload, {
    responseType: "blob",
  });

  return res.data;
};

/**
 * Extraer texto del archivo
 */
export const extraerTextoDocumento = async (
  file: File
): Promise<ExtraerTextoResponse> => {
  const formData = new FormData();
  formData.append("archivo", file);

  const { data } = await api.post<ExtraerTextoResponse>(
    "/documentos/extraer-texto",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
