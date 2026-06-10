/**
 * Google Gemini AI integration for personalized eco-insights.
 *
 * Uses the Google Generative AI SDK (Gemini) to generate
 * contextual, personalized carbon reduction tips based on
 * the user's actual emission breakdown data. Falls back to
 * hardcoded tips when API key is not configured.
 *
 * @module gemini
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { CategoryBreakdown, NudgeCard } from "./schemas";
import { CATEGORY_LABELS, EMISSION_CATEGORIES, type EmissionCategory } from "./constants";
import { logger } from "./logger";

// ── Configuration ───────────────────────────────────────────────────

/** Gemini API key from environment variables. */
const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? "";

/** Whether Gemini is configured with a valid API key. */
const isGeminiConfigured: boolean = GEMINI_API_KEY.length > 0;

/** Gemini model identifier. */
const GEMINI_MODEL = "gemini-2.0-flash" as const;

/** Maximum number of insights to generate. */
const MAX_INSIGHTS = 4 as const;

/** Cache duration in milliseconds (5 minutes). */
const CACHE_DURATION_MS = 300_000 as const;

// ── Model Initialization ────────────────────────────────────────────

/** Gemini generative model instance. */
let model: GenerativeModel | null = null;

if (isGeminiConfigured) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    logger.info("Gemini AI initialized", {
      component: "gemini",
      model: GEMINI_MODEL,
    });
  } catch (error: unknown) {
    logger.error("Gemini initialization failed", {
      component: "gemini",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ── Insight Cache ───────────────────────────────────────────────────

/** Cached insight response to avoid excessive API calls. */
interface InsightCache {
  readonly insights: ReadonlyArray<NudgeCard>;
  readonly timestamp: number;
  readonly breakdownKey: string;
}

/** Current cache entry. */
let cachedInsights: InsightCache | null = null;

/**
 * Creates a cache key from the category breakdown.
 *
 * @param breakdown - Current emission breakdown
 * @returns Deterministic cache key string
 */
function createBreakdownKey(breakdown: CategoryBreakdown): string {
  return `${breakdown.transport}-${breakdown.diet}-${breakdown.home}-${breakdown.shopping}`;
}

// ── Prompt Engineering ──────────────────────────────────────────────

/**
 * Builds the Gemini prompt from user's emission data.
 *
 * @param breakdown - Current category breakdown
 * @param totalScore - User's total eco-score
 * @returns Formatted prompt string
 */
function buildInsightPrompt(
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
function parseGeminiResponse(responseText: string): ReadonlyArray<string> {
  try {
    // Strip markdown code fences if present
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
      responseText: responseText.slice(0, 200),
    });
    return [];
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generates personalized eco-insights using Google Gemini AI.
 *
 * Returns cached results if the breakdown hasn't changed within
 * the cache window. Falls back gracefully when API is unavailable.
 *
 * @param breakdown - Current emission category breakdown
 * @param totalScore - User's total eco-score
 * @param topCategory - The highest-emission category
 * @returns Array of nudge cards with AI-generated tips
 */
export async function generateGeminiInsights(
  breakdown: CategoryBreakdown,
  totalScore: number,
  topCategory: EmissionCategory
): Promise<ReadonlyArray<NudgeCard>> {
  // Check cache first
  const breakdownKey = createBreakdownKey(breakdown);
  if (
    cachedInsights &&
    cachedInsights.breakdownKey === breakdownKey &&
    Date.now() - cachedInsights.timestamp < CACHE_DURATION_MS
  ) {
    return cachedInsights.insights;
  }

  if (!model) {
    logger.debug("Gemini not available — using fallback insights", {
      component: "gemini",
    });
    return [];
  }

  try {
    const prompt = buildInsightPrompt(breakdown, totalScore);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const tips = parseGeminiResponse(responseText);

    if (tips.length === 0) {
      return [];
    }

    const insights: ReadonlyArray<NudgeCard> = tips.map(
      (tip, index): NudgeCard => ({
        id: `gemini-${topCategory}-${index}`,
        category: topCategory,
        message: tip,
        priority: index,
      })
    );

    // Update cache
    cachedInsights = {
      insights,
      timestamp: Date.now(),
      breakdownKey,
    };

    logger.info("Gemini insights generated successfully", {
      component: "gemini",
      count: insights.length,
    });

    return insights;
  } catch (error: unknown) {
    logger.error("Gemini insight generation failed", {
      component: "gemini",
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Whether Gemini AI is available for use.
 *
 * @returns true if the Gemini API key is configured and model is initialized
 */
export function isGeminiAvailable(): boolean {
  return isGeminiConfigured && model !== null;
}
