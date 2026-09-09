import pdfParse from "pdf-parse";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Extracts plain text from an uploaded file buffer.
 *
 * @param {Buffer} buffer - The uploaded file's raw bytes (from multer's memory storage).
 * @param {string} mimeType
 * @returns {Promise<string>} extracted text
 */
export async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const result = await pdfParse(buffer);
    // Cap PDF length at 5 pages. This keeps each document's extracted text (and
    // therefore each Gemini request built from it) small and predictable — a
    // 200-page textbook would blow past what's reasonable to summarize into a
    // handful of flashcards anyway, so this also nudges toward the tool's actual
    // intended use: a focused set of revision notes, not an entire textbook.
    if (result.numpages > 5) {
      throw new Error(
        `This PDF has ${result.numpages} pages — please upload a document of 5 pages or fewer.`
      );
    }
    return result.text;
  }

  if (mimeType.startsWith("image/")) {
    // Gemini's Flash models read images directly — no separate OCR library needed.
    // inline_data uses snake_case here because we're calling the raw REST API
    // rather than a client SDK (SDKs typically camelCase this to inlineData).
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } },
              { text: "Transcribe all readable text from this image exactly as written. Return only the transcribed text, nothing else." },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  // TODO Week 1 stretch: DOCX support via the `mammoth` package.
  throw new Error(`Unsupported file type: ${mimeType}. PDF and images are supported so far.`);
}
