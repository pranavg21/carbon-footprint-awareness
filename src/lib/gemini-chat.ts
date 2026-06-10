/**
 * Gemini AI interactive chat for sustainability questions.
 *
 * Provides askGemini() with retry logic and contextual
 * demo fallback when the API is rate-limited.
 *
 * @module gemini-chat
 */

import type { GenerativeModel } from "@google/generative-ai";
import { logger } from "./logger";
import { DEMO_ANSWERS, DEFAULT_DEMO_ANSWER } from "./gemini-demo-data";

/** Maximum retries for rate-limited requests. */
const MAX_RETRIES = 2 as const;

/** Base retry delay in milliseconds. */
const RETRY_DELAY_MS = 3_000 as const;

/** System prompt for the Gemini eco-assistant. */
const SYSTEM_PROMPT = [
  "You are CarbonTrack AI, an expert sustainability assistant.",
  "Answer questions about carbon footprint reduction, eco-friendly habits,",
  "climate science, and environmental impact. Be specific with numbers",
  "and actionable advice. Keep responses under 150 words. Use bullet",
  "points for lists. Always be encouraging and positive.",
].join(" ");

/**
 * Returns a contextual demo answer based on keyword matching.
 *
 * @param question - The user's question
 * @returns Demo answer string
 */
function getDemoAnswer(question: string): string {
  const match = DEMO_ANSWERS.find((entry) => entry.pattern.test(question));
  return match?.answer ?? DEFAULT_DEMO_ANSWER;
}

/**
 * Asks Gemini AI a sustainability question with retry logic.
 * Falls back to contextual demo answers when the API is unavailable.
 *
 * @param model - The Gemini model instance (or null)
 * @param question - The user's question
 * @returns AI-generated response string
 */
export async function askGeminiQuestion(
  model: GenerativeModel | null,
  question: string
): Promise<string> {
  if (!model) {
    return getDemoAnswer(question);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(
        `${SYSTEM_PROMPT}\n\nUser question: ${question}`
      );
      return result.response.text();
    } catch (error: unknown) {
      const isRateLimit =
        error instanceof Error && error.message.includes("429");

      if (isRateLimit && attempt < MAX_RETRIES) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1));
        });
        continue;
      }

      logger.error("Gemini chat failed", {
        component: "gemini-chat",
        error: error instanceof Error ? error.message : String(error),
      });
      return getDemoAnswer(question);
    }
  }

  return getDemoAnswer(question);
}
