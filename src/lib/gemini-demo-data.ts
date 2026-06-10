/**
 * Demo data for Gemini fallback when the API is unavailable.
 *
 * Contains curated eco-tips by emission category and
 * pattern-matched answers for common sustainability questions.
 *
 * @module gemini-demo-data
 */

import type { EmissionCategory } from "./constants";

/** Demo insights organized by category. */
export const DEMO_TIPS: Record<EmissionCategory, ReadonlyArray<string>> = {
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

/** Pre-built demo answers for common sustainability questions. */
export const DEMO_ANSWERS: ReadonlyArray<{
  readonly pattern: RegExp;
  readonly answer: string;
}> = [
  {
    pattern: /carbon footprint|co2|emissions/i,
    answer:
      "Your carbon footprint is the total greenhouse gases you produce. Key ways to reduce it:\n\n• **Transport**: Walk, bike, or use public transit — saves ~2.5 tonnes CO₂/year\n• **Diet**: Eat plant-based meals 3x/week — saves ~0.8 tonnes CO₂/year\n• **Home**: Switch to LEDs and smart thermostats — saves ~0.5 tonnes CO₂/year\n• **Shopping**: Buy second-hand and reduce packaging — saves ~0.3 tonnes CO₂/year\n\nThe average person produces ~4.5 tonnes CO₂/year. Every action counts!",
  },
  {
    pattern: /plant.?based|vegan|vegetarian|meat|diet|food/i,
    answer:
      'Great question! Shifting to a plant-based diet is one of the most impactful changes:\n\n• **One meatless day/week** reduces food emissions by ~14%\n• **Beef → chicken** cuts meal emissions by ~60%\n• **Seasonal produce** reduces transport emissions by ~30%\n• **Reducing food waste** saves ~500 kg CO₂/year per person\n\nYou don\'t need to go fully vegan — even small shifts make a big difference! Start with "Meatless Mondays" and build from there. 🌱',
  },
  {
    pattern: /transport|car|drive|fly|travel|commute/i,
    answer:
      "Transport is often the largest part of your carbon footprint:\n\n• **Cycling 3x/week** cuts transport emissions by ~40%\n• **Carpooling twice/week** saves ~1,200 kg CO₂/year\n• **Working from home** one extra day saves ~20% commute emissions\n• **Train vs. plane** for trips under 800km saves ~80% CO₂\n\nIf you must drive, keep tires inflated (+3% efficiency) and combine trips. Every kilometer counts! 🚲",
  },
  {
    pattern: /energy|electricity|solar|renewable|home|power/i,
    answer:
      "Home energy is a major opportunity for savings:\n\n• **LED bulbs** use 75% less energy — switch 5 bulbs to save 200 kg CO₂/year\n• **Lower thermostat by 2°C** saves 10% on heating\n• **Smart power strips** eliminate phantom loads (5-10% savings)\n• **Air-dry clothes** instead of dryer saves ~150 kg CO₂/year\n• **Solar panels** can cut home emissions by 80%+\n\nStart with the free changes first — they add up fast! ⚡",
  },
  {
    pattern: /recycle|waste|plastic|packaging|shopping/i,
    answer:
      "Reducing waste has a bigger impact than most people realize:\n\n• **Buy second-hand** reduces fashion emissions by up to 82%\n• **Minimal packaging** products cut waste by ~30%\n• **Repairing electronics** instead of replacing saves ~50 kg CO₂ each\n• **Reusable bags** used 50x replace 500 single-use plastic bags\n• **Composting** food scraps reduces methane from landfills\n\nRemember: Reduce > Reuse > Recycle — in that order! ♻️",
  },
];

/** Default fallback answer for unrecognized questions. */
export const DEFAULT_DEMO_ANSWER =
  "That's a great eco-question! Here are some general tips to reduce your environmental impact:\n\n• **Track your actions** — awareness is the first step to change\n• **Start small** — one new eco-habit per week builds momentum\n• **Focus on transport & diet** — these have the biggest impact\n• **Share your journey** — inspire others to make changes too\n\nKeep logging your eco-actions in CarbonTrack to see your progress! Every small step adds up to a massive impact. 🌍" as const;
