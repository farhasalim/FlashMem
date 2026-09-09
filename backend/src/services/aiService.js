import dotenv from "dotenv";
dotenv.config();

// Using Gemini's REST API directly with fetch rather than an SDK — this avoids
// depending on a specific SDK version's method names, which have changed more
// than once as Google's Gemini libraries have evolved. A plain HTTP call is more
// stable for a learning project like this one.
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

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

  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    return JSON.parse(raw.trim());
  } catch (err) {
    // Gemini occasionally wraps JSON in prose or markdown fences despite instructions —
    // fall back to extracting the first [...] block before giving up.
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse Gemini's response as JSON: " + raw.slice(0, 200));
  }
}
