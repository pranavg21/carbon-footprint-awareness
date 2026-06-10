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
    logger.debug("Gemini API not configured — using demo insights", {
      component: "gemini",
    });
    return generateDemoInsights(breakdown, totalScore, topCategory);
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
 * Whether the Gemini integration is active (live API or demo mode).
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

// ── Demo Mode ───────────────────────────────────────────────────────

/** Demo insights organized by category, using the user's real data. */
const DEMO_TIPS: Record<EmissionCategory, ReadonlyArray<string>> = {
  transport: [
    "Cycling 3x/week can cut transport emissions by up to 40%.",
    "Carpooling just twice a week saves ~1,200 kg CO₂ per year.",
    "Try working from home one extra day — it saves 20% in commute emissions.",
    "Electric scooters produce 85% fewer emissions than cars for short trips.",
  ],
  diet: [
    "One plant-based day per week reduces your food footprint by 14%.",
    "Buying seasonal produce cuts food transport emissions by up to 30%.",
    "Reducing food waste by half saves ~500 kg CO₂ per year per person.",
    "Swapping beef for chicken reduces meal emissions by 60%.",
  ],
  home: [
    "LED bulbs use 75% less energy — switch 5 bulbs to save 200 kg CO₂/year.",
    "Lowering thermostat by 2°C saves 10% on heating energy.",
    "Smart power strips eliminate phantom loads — saving 5-10% electricity.",
    "Air-drying clothes instead of dryer saves ~150 kg CO₂ per year.",
  ],
  shopping: [
    "Buying second-hand reduces fashion emissions by up to 82%.",
    "Choosing products with minimal packaging cuts waste by 30%.",
    "Repairing electronics instead of replacing saves ~50 kg CO₂ each.",
    "A reusable bag used 50x replaces 500 single-use plastic bags.",
  ],
};

/**
 * Generates demo insights based on the user's actual emission data.
 * These simulate what Gemini would return with contextual personalization.
 *
 * @param breakdown - Current category breakdown
 * @param totalScore - User's total eco-score
 * @param topCategory - The highest-emission category
 * @returns Array of nudge cards with demo tips
 */
function generateDemoInsights(
  _breakdown: CategoryBreakdown,
  _totalScore: number,
  topCategory: EmissionCategory
): ReadonlyArray<NudgeCard> {
  const tips = DEMO_TIPS[topCategory];
  return tips.map(
    (tip, index): NudgeCard => ({
      id: `gemini-demo-${topCategory}-${index}`,
      category: topCategory,
      message: tip,
      priority: index,
    })
  );
}

// ── Interactive Chat ────────────────────────────────────────────────

/** System prompt for the Gemini eco-assistant. */
const SYSTEM_PROMPT = [
  "You are CarbonTrack AI, an expert sustainability assistant.",
  "Answer questions about carbon footprint reduction, eco-friendly habits,",
  "climate science, and environmental impact. Be specific with numbers",
  "and actionable advice. Keep responses under 150 words. Use bullet",
  "points for lists. Always be encouraging and positive.",
].join(" ");

/** Maximum retries for rate-limited requests. */
const MAX_RETRIES = 2 as const;

/** Base retry delay in milliseconds. */
const RETRY_DELAY_MS = 3_000 as const;

/** Pre-built demo answers for common eco-questions. */
const DEMO_ANSWERS: ReadonlyArray<{ readonly pattern: RegExp; readonly answer: string }> = [
  {
    pattern: /carbon footprint|co2|emissions/i,
    answer: "Your carbon footprint is the total greenhouse gases you produce. Key ways to reduce it:\n\n• **Transport**: Walk, bike, or use public transit — saves ~2.5 tonnes CO₂/year\n• **Diet**: Eat plant-based meals 3x/week — saves ~0.8 tonnes CO₂/year\n• **Home**: Switch to LEDs and smart thermostats — saves ~0.5 tonnes CO₂/year\n• **Shopping**: Buy second-hand and reduce packaging — saves ~0.3 tonnes CO₂/year\n\nThe average person produces ~4.5 tonnes CO₂/year. Every action counts!",
  },
  {
    pattern: /plant.?based|vegan|vegetarian|meat|diet|food/i,
    answer: "Great question! Shifting to a plant-based diet is one of the most impactful changes:\n\n• **One meatless day/week** reduces food emissions by ~14%\n• **Beef → chicken** cuts meal emissions by ~60%\n• **Seasonal produce** reduces transport emissions by ~30%\n• **Reducing food waste** saves ~500 kg CO₂/year per person\n\nYou don't need to go fully vegan — even small shifts make a big difference! Start with \"Meatless Mondays\" and build from there. 🌱",
  },
  {
    pattern: /transport|car|drive|fly|travel|commute/i,
    answer: "Transport is often the largest part of your carbon footprint:\n\n• **Cycling 3x/week** cuts transport emissions by ~40%\n• **Carpooling twice/week** saves ~1,200 kg CO₂/year\n• **Working from home** one extra day saves ~20% commute emissions\n• **Train vs. plane** for trips under 800km saves ~80% CO₂\n\nIf you must drive, keep tires inflated (+3% efficiency) and combine trips. Every kilometer counts! 🚲",
  },
  {
    pattern: /energy|electricity|solar|renewable|home|power/i,
    answer: "Home energy is a major opportunity for savings:\n\n• **LED bulbs** use 75% less energy — switch 5 bulbs to save 200 kg CO₂/year\n• **Lower thermostat by 2°C** saves 10% on heating\n• **Smart power strips** eliminate phantom loads (5-10% savings)\n• **Air-dry clothes** instead of dryer saves ~150 kg CO₂/year\n• **Solar panels** can cut home emissions by 80%+\n\nStart with the free changes first — they add up fast! ⚡",
  },
  {
    pattern: /recycle|waste|plastic|packaging|shopping/i,
    answer: "Reducing waste has a bigger impact than most people realize:\n\n• **Buy second-hand** reduces fashion emissions by up to 82%\n• **Minimal packaging** products cut waste by ~30%\n• **Repairing electronics** instead of replacing saves ~50 kg CO₂ each\n• **Reusable bags** used 50x replace 500 single-use plastic bags\n• **Composting** food scraps reduces methane from landfills\n\nRemember: Reduce > Reuse > Recycle — in that order! ♻️",
  },
];

/** Default fallback answer for unrecognized questions. */
const DEFAULT_DEMO_ANSWER = "That's a great eco-question! Here are some general tips to reduce your environmental impact:\n\n• **Track your actions** — awareness is the first step to change\n• **Start small** — one new eco-habit per week builds momentum\n• **Focus on transport & diet** — these have the biggest impact\n• **Share your journey** — inspire others to make changes too\n\nKeep logging your eco-actions in CarbonTrack to see your progress! Every small step adds up to a massive impact. 🌍" as const;

/**
 * Asks Gemini AI a question about carbon footprint and sustainability.
 * Falls back to contextual demo answers when the API is unavailable.
 *
 * @param question - The user's question
 * @returns AI-generated response string
 */
export async function askGemini(question: string): Promise<string> {
  if (!model) {
    logger.debug("Gemini API not available — using demo answer", {
      component: "gemini",
    });
    return getDemoAnswer(question);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(
        `${SYSTEM_PROMPT}\n\nUser question: ${question}`
      );
      const text = result.response.text();

      logger.info("Gemini chat response generated", {
        component: "gemini",
        questionLength: question.length,
        responseLength: text.length,
      });

      return text;
    } catch (error: unknown) {
      const isRateLimit =
        error instanceof Error && error.message.includes("429");

      if (isRateLimit && attempt < MAX_RETRIES) {
        logger.debug("Gemini rate limited — retrying", {
          component: "gemini",
          attempt: attempt + 1,
        });
        await new Promise<void>((resolve) => {
          setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1));
        });
        continue;
      }

      logger.error("Gemini chat failed — using demo answer", {
        component: "gemini",
        error: error instanceof Error ? error.message : String(error),
      });
      return getDemoAnswer(question);
    }
  }

  return getDemoAnswer(question);
}

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

