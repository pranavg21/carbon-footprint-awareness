/**
 * Gemini insight prompt construction and response parsing.
 *
 * Extracted from gemini.ts for single responsibility.
 *
 * @module gemini-prompts
 */

import type { CategoryBreakdown } from "./schemas";
import { CATEGORY_LABELS, EMISSION_CATEGORIES } from "./constants";
import { logger } from "./logger";

/** Maximum number of insights to generate. */
export const MAX_INSIGHTS = 4 as const;

/**
 * Builds the Gemini insight prompt from user data.
 *
 * @param breakdown - Category breakdown
 * @param totalScore - User's total eco-score
 * @returns Formatted prompt string
 */
export function buildInsightPrompt(
  breakdown: CategoryBreakdown,
  totalScore: number
): string {
  const categories = EMISSION_CATEGORIES
    .map((cat) => `${CATEGORY_LABELS[cat]}: ${breakdown[cat]} points`)
    .join(", ");

  return [
    "You are an eco-sustainability advisor. Based on the following carbon tracking data,",
    "generate exactly 4 personalized, actionable tips to help reduce carbon footprint.",
    "",
    `User Data: Total eco-score: ${totalScore} points. Breakdown: ${categories}.`,
    "",
    "Rules:",
    "- Each tip must be 1 sentence, max 120 characters",
    "- Focus tips on the HIGHEST category",
    "- Include specific numbers/percentages where possible",
    "- Be encouraging, not preachy",
    "- Return ONLY a JSON array of 4 strings, no markdown",
    "",
    'Example: ["Tip one here.", "Tip two here.", "Tip three here.", "Tip four here."]',
  ].join("\n");
}

/**
 * Parses Gemini response into an array of tip strings.
 *
 * @param responseText - Raw text from Gemini API
 * @returns Array of tip strings, or empty array on parse failure
 */
export function parseGeminiResponse(responseText: string): ReadonlyArray<string> {
  try {
    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    if (
      Array.isArray(parsed) &&
      parsed.every((item): item is string => typeof item === "string")
    ) {
      return parsed.slice(0, MAX_INSIGHTS);
    }

    logger.warn("Gemini response was not a string array", {
      component: "gemini",
    });
    return [];
  } catch (error: unknown) {
    logger.error("Failed to parse Gemini response", {
      component: "gemini",
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
