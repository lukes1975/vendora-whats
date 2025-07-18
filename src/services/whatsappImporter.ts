import { toast } from "sonner";

export interface WhatsAppImportResponse {
  success: boolean;
  message?: string;
  imported_count?: number;
}

export async function sendToWhatsappImporter(phone: string): Promise<WhatsAppImportResponse> {
  try {
    const res = await fetch("https://vendora-whatsapp-importer.onrender.com/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to import WhatsApp contact", errorText);
      throw new Error(`Failed to connect to WhatsApp Importer: ${res.status}`);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("WhatsApp import error:", error);
    throw error;
  }
}