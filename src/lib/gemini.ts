/**
 * Google Gemini AI integration for personalized eco-insights.
 *
 * Provides insight generation and interactive chat via the
 * Gemini API. Falls back to curated demo data when the
 * API key is not configured or quota is exhausted.
 *
 * @module gemini
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { CategoryBreakdown, NudgeCard } from "./schemas";
import type { EmissionCategory } from "./constants";
import { logger } from "./logger";
import { DEMO_TIPS } from "./gemini-demo-data";
import { askGeminiQuestion } from "./gemini-chat";
import { buildInsightPrompt, parseGeminiResponse } from "./gemini-prompts";

// ── Configuration ───────────────────────────────────────────────────

/** Gemini API key from environment variables. */
const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? "";

/** Whether Gemini is configured with a valid API key. */
const isGeminiConfigured: boolean = GEMINI_API_KEY.length > 0;

/** Gemini model identifier. */
const GEMINI_MODEL = "gemini-2.0-flash" as const;



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

// ── Cache ───────────────────────────────────────────────────────────

/** Cached insight response shape. */
interface InsightCache {
  readonly insights: ReadonlyArray<NudgeCard>;
  readonly timestamp: number;
  readonly breakdownKey: string;
}

/** Current cache entry. */
let cachedInsights: InsightCache | null = null;

/**
 * Creates a deterministic cache key from emission breakdown.
 *
 * @param breakdown - Current emission breakdown
 * @returns Cache key string
 */
function createBreakdownKey(breakdown: CategoryBreakdown): string {
  return `${breakdown.transport}-${breakdown.diet}-${breakdown.home}-${breakdown.shopping}`;
}



// ── Demo Insights ───────────────────────────────────────────────────

/**
 * Generates demo insights from curated tips data.
 *
 * @param topCategory - The highest-emission category
 * @returns Array of nudge cards with demo tips
 */
function generateDemoInsights(
  topCategory: EmissionCategory
): ReadonlyArray<NudgeCard> {
  return DEMO_TIPS[topCategory].map(
    (tip, index): NudgeCard => ({
      id: `gemini-demo-${topCategory}-${index}`,
      category: topCategory,
      message: tip,
      priority: index,
    })
  );
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generates personalized eco-insights using Google Gemini AI.
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
  const breakdownKey = createBreakdownKey(breakdown);

  if (
    cachedInsights &&
    cachedInsights.breakdownKey === breakdownKey &&
    Date.now() - cachedInsights.timestamp < CACHE_DURATION_MS
  ) {
    return cachedInsights.insights;
  }

  if (!model) {
    return generateDemoInsights(topCategory);
  }

  try {
    const prompt = buildInsightPrompt(breakdown, totalScore);
    const result = await model.generateContent(prompt);
    const tips = parseGeminiResponse(result.response.text());

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

    cachedInsights = { insights, timestamp: Date.now(), breakdownKey };
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
 * Whether the Gemini integration is active.
 *
 * @returns true — Gemini always provides insights (live or demo)
 */
export function isGeminiAvailable(): boolean {
  return true;
}

/**
 * Whether Gemini is using the live API (vs demo mode).
 *
 * @returns true if the Gemini API key is configured and model is initialized
 */
export function isGeminiLive(): boolean {
  return isGeminiConfigured && model !== null;
}

/**
 * Asks Gemini AI a sustainability question.
 * Delegates to gemini-chat module with the current model instance.
 *
 * @param question - The user's question
 * @returns AI-generated response string
 */
export async function askGemini(question: string): Promise<string> {
  return askGeminiQuestion(model, question);
}
