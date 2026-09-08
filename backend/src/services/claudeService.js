import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generates flashcard-style Q&A pairs from raw document text, targeted at a stated goal.
 *
 * @param {string} text - Extracted text from the user's uploaded document.
 * @param {string} goalTitle - The user's stated goal, e.g. "Pass my thermodynamics midterm".
 * @param {string} [goalDescription] - Optional extra context to sharpen question targeting.
 * @param {number} [count=10] - How many Q&A pairs to generate. TODO Week 2: scale this with
 *   material length per the PRD's "capped at 25" rule instead of a fixed default.
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
export async function generateQuestions(text, goalTitle, goalDescription, count = 10) {
  const prompt = `You are helping a student studying toward this goal: "${goalTitle}".
${goalDescription ? `Additional context: ${goalDescription}` : ""}

Based on the study material below, generate exactly ${count} flashcard-style question and answer pairs. Focus on concepts that would actually be tested, not trivial details. Keep answers concise (1-3 sentences).

Respond with ONLY a JSON array, no other text, no markdown code fences. Format:
[{"question": "...", "answer": "..."}, ...]

Study material:
"""
${text.slice(0, 12000)}
"""`; // TODO Week 2: chunk longer documents instead of truncating

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  try {
    return JSON.parse(raw.trim());
  } catch (err) {
    // Claude occasionally wraps JSON in prose despite instructions — fall back to
    // extracting the first [...] block before giving up. TODO Week 2: make this more robust.
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse Claude's response as JSON: " + raw.slice(0, 200));
  }
}
