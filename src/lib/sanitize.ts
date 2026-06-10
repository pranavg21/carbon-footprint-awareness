/**
 * Input sanitization utilities for the CarbonTrack platform.
 *
 * Strips potentially dangerous content from user inputs before
 * processing. Used as a defense-in-depth layer alongside Zod
 * schema validation.
 *
 * @module sanitize
 */

/** Maximum allowed length for user-provided text inputs. */
const MAX_INPUT_LENGTH = 200 as const;

/** Pattern matching HTML tags. */
const HTML_TAG_PATTERN = /<[^>]*>/g;

/** Pattern matching dangerous URI schemes. */
const DANGEROUS_URI_PATTERN = /javascript:|data:|vbscript:/gi;

/** Pattern matching control characters (except newline/tab). */
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = new RegExp("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "g");

/**
 * Sanitizes a user-provided text input by stripping HTML tags,
 * dangerous URI schemes, and control characters.
 *
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length (defaults to MAX_INPUT_LENGTH)
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeInput(
  input: string,
  maxLength: number = MAX_INPUT_LENGTH
): string {
  return input
    .replace(HTML_TAG_PATTERN, "")
    .replace(DANGEROUS_URI_PATTERN, "")
    .replace(CONTROL_CHAR_PATTERN, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Checks whether a string contains potentially dangerous content.
 *
 * @param input - String to check
 * @returns true if the input contains HTML tags or dangerous URIs
 */
export function containsDangerousContent(input: string): boolean {
  return /<[^>]*>/.test(input) || /javascript:|data:|vbscript:/i.test(input);
}
