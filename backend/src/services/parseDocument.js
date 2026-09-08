import pdfParse from "pdf-parse";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    return result.text;
  }

  if (mimeType.startsWith("image/")) {
    // Claude's vision capability reads the image directly — no separate OCR library needed.
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: buffer.toString("base64"),
              },
            },
            {
              type: "text",
              text: "Transcribe all readable text from this image exactly as written. Return only the transcribed text, nothing else.",
            },
          ],
        },
      ],
    });
    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
  }

  // TODO Week 1 stretch: DOCX support via the `mammoth` package
  // (already available in this environment's skill set — see /mnt/skills/public/docx).
  throw new Error(`Unsupported file type: ${mimeType}. PDF and images are supported so far.`);
}
