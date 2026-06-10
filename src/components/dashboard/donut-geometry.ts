/**
 * SVG donut chart geometry utilities.
 *
 * Pure math functions for computing arc paths and
 * polar-to-cartesian coordinate transforms.
 *
 * @module donut-geometry
 */

import type { EmissionCategory } from "../../lib/constants";

/** SVG donut configuration. */
export const DONUT_SIZE = 200;

/** Center coordinate of the donut SVG. */
export const DONUT_CENTER = DONUT_SIZE / 2;

/** Outer radius of the donut ring. */
export const DONUT_OUTER_RADIUS = 88;

/** Inner radius of the donut ring. */
export const DONUT_INNER_RADIUS = 58;

/** Gap between segments in degrees. */
export const SEGMENT_GAP_DEGREES = 3;

/** Shape for a computed arc segment. */
export interface ArcSegment {
  readonly category: EmissionCategory;
  readonly value: number;
  readonly percentage: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly path: string;
  readonly color: string;
}

/**
 * Converts polar coordinates to SVG cartesian coordinates.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param radius - Arc radius
 * @param angleDeg - Angle in degrees
 * @returns Cartesian x, y point
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/**
 * Generates an SVG arc path string for a donut segment.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param outerR - Outer radius
 * @param innerR - Inner radius
 * @param startAngle - Start angle in degrees
 * @param endAngle - End angle in degrees
 * @returns SVG path d-string
 */
export function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const arcSweep = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${arcSweep} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${arcSweep} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}
