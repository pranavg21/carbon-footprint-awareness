/**
 * Markdown-like text formatting for Gemini AI responses.
 *
 * Renders bold text safely without dangerouslySetInnerHTML
 * and formats bullet points with proper spacing.
 *
 * @module chat-formatter
 */

import React from "react";

/**
 * Parses a line and renders bold text safely.
 * Splits on `**bold**` markers and wraps in strong tags.
 *
 * @param line - Raw text line
 * @returns Array of React nodes with bold segments
 */
export function renderBoldText(line: string): ReadonlyArray<React.ReactNode> {
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, idx): React.ReactNode =>
    idx % 2 === 1 ? (
      <strong key={idx} className="text-emerald-300 font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

/**
 * Formats raw answer text with basic markdown-like styling.
 * Uses safe React rendering — no dangerouslySetInnerHTML.
 *
 * @param text - Raw answer text
 * @returns Formatted JSX
 */
export function formatAnswer(text: string): React.JSX.Element {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const key = `line-${i}`;
        if (line.trim().length === 0) return <br key={key} />;

        const isBullet =
          line.trim().startsWith("•") || line.trim().startsWith("-");

        return (
          <p
            key={key}
            className={`text-sm text-slate-300${isBullet ? " pl-2" : ""}`}
          >
            {renderBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}
