/**
 * Data export utility for downloading user data as JSON.
 *
 * Centralizes the Blob → URL → anchor → click → revoke pattern
 * to eliminate duplication across Header and SettingsPage.
 *
 * @module export
 */

import { EXPORT_VERSION, JSON_MIME_TYPE, EXPORT_FILENAME_PREFIX } from "./constants";
import { logger } from "./logger";
import { getTodayDateString } from "./utils";

/**
 * Downloads a JavaScript object as a formatted JSON file.
 *
 * @param data - The data object to export
 * @param source - Identifier for logging which component triggered the export
 */
export function downloadAsJSON(
  data: Record<string, unknown>,
  source: string
): void {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: JSON_MIME_TYPE }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${EXPORT_FILENAME_PREFIX}${getTodayDateString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);

  logger.info("Data exported", { component: source });
}
