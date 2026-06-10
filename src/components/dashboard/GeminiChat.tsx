/**
 * Interactive Gemini AI search bar for eco-questions.
 *
 * Provides a prominent "Ask Gemini" input where users can type
 * sustainability questions and receive AI-powered responses.
 * Includes loading states, markdown-like formatting, and
 * graceful demo fallback when the API is rate-limited.
 *
 * @module GeminiChat
 */

import { useState, useCallback, useRef } from "react";
import { Sparkles, Send, Loader2, X, Bot } from "lucide-react";
import { askGemini, isGeminiLive } from "../../lib/gemini";
import { sanitizeInput } from "../../lib/sanitize";
import { logger } from "../../lib/logger";

/** Maximum character length for questions. */
const MAX_QUESTION_LENGTH = 300 as const;

/** Suggested quick questions for the user. */
const QUICK_QUESTIONS: ReadonlyArray<string> = [
  "How can I reduce my carbon footprint?",
  "What foods have the lowest emissions?",
  "Is cycling better than public transit?",
  "How much CO₂ do solar panels save?",
] as const;

/**
 * Interactive Gemini AI chat search bar component.
 *
 * @returns React JSX Element
 */
export default function GeminiChat(): React.JSX.Element {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const geminiLive = isGeminiLive();

  /**
   * Handles form submission — sends the question to Gemini.
   *
   * @param e - Form submit event
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmed = sanitizeInput(question.trim(), MAX_QUESTION_LENGTH);
      if (trimmed.length === 0 || isLoading) return;

      setIsLoading(true);
      setIsOpen(true);
      setAnswer("");

      logger.info("Gemini chat question submitted", {
        component: "gemini-chat",
        questionLength: trimmed.length,
      });

      try {
        const response = await askGemini(trimmed);
        setAnswer(response);
      } catch (error: unknown) {
        logger.error("Gemini chat error", {
          component: "gemini-chat",
          error: error instanceof Error ? error.message : String(error),
        });
        setAnswer(
          "Sorry, I couldn't process that question right now. Please try again!"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [question, isLoading]
  );

  /**
   * Handles quick question click.
   *
   * @param q - The quick question text
   */
  const handleQuickQuestion = useCallback(
    (q: string): void => {
      setQuestion(q);
      inputRef.current?.focus();
    },
    []
  );

  /**
   * Clears the current answer and resets the chat.
   */
  const handleClear = useCallback((): void => {
    setAnswer("");
    setQuestion("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  /**
   * Parses a line and renders bold text safely without dangerouslySetInnerHTML.
   *
   * @param line - Raw text line
   * @returns Array of React nodes with bold segments wrapped in strong tags
   */
  const renderBoldText = useCallback((line: string): ReadonlyArray<React.ReactNode> => {
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
  }, []);

  /**
   * Formats the answer text with basic markdown-like styling.
   * Uses safe React rendering — no dangerouslySetInnerHTML.
   *
   * @param text - Raw answer text
   * @returns Formatted JSX
   */
  const formatAnswer = useCallback((text: string): React.JSX.Element => {
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
  }, [renderBoldText]);

  return (
    <section
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-5 transition-all duration-300"
      aria-label="Ask Gemini AI about sustainability"
      id="gemini-chat"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Ask Gemini AI
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                geminiLive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
              }`}
            >
              {geminiLive ? "Live" : "Demo"}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Ask anything about sustainability and carbon reduction
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => { void handleSubmit(e); }}
        className="relative mb-3"
        role="search"
        aria-label="Ask Gemini a sustainability question"
      >
        <input
          ref={inputRef}
          type="text"
          id="gemini-search-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
          placeholder="How can I reduce my carbon footprint?"
          className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          disabled={isLoading}
          aria-label="Type your sustainability question"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={question.trim().length === 0 || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-30 hover:from-violet-400 hover:to-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Send question to Gemini AI"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </form>

      {/* Quick Questions */}
      {!isOpen && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleQuickQuestion(q)}
              className="text-xs bg-slate-800/60 border border-slate-700/40 text-slate-400 rounded-lg px-3 py-1.5 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              aria-label={`Ask: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Answer Display */}
      {isOpen && (
        <div
          className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300"
          role="region"
          aria-label="Gemini AI response"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Thinking...</span>
                </div>
              ) : (
                formatAnswer(answer)
              )}
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="w-6 h-6 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                aria-label="Clear response and ask another question"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
