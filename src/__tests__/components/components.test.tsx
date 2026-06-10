/**
 * Tests for React components.
 *
 * @module components.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Components
import { SkipLink } from "../../components/layout/SkipLink";
import { Header } from "../../components/layout/Header";
import { GlassCard } from "../../components/shared/GlassCard";
import { ActionDock } from "../../components/actions/ActionDock";
import { ToastContainer } from "../../components/feedback/ToastContainer";
import { NudgeFeed } from "../../components/nudges/NudgeFeed";
import { HeroScore } from "../../components/dashboard/HeroScore";
import { StatsRow } from "../../components/dashboard/StatsRow";

// Stores
import { useCarbonStore } from "../../store/carbon-store";
import { useToastStore } from "../../hooks/useToast";

// Constants
import { MAIN_CONTENT_ID, QUICK_ACTIONS } from "../../lib/constants";

// Mock zustand persist middleware to prevent localStorage rehydration loops in jsdom
vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("zustand/middleware");
  return {
    ...actual,
    persist: (config: unknown) => config,
  };
});

// Mock Recharts to avoid SVG rendering issues in JSDOM
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pie-chart" }, children),
  Pie: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  Cell: () => React.createElement("div"),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  Tooltip: () => null,
}));

describe("SkipLink", () => {
  it("should render with correct href", () => {
    render(React.createElement(SkipLink));
    const link = screen.getByText("Skip to main content");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
  });

  it("should have accessible label", () => {
    render(React.createElement(SkipLink));
    const link = screen.getByLabelText("Skip to main content");
    expect(link).toBeInTheDocument();
  });
});

describe("GlassCard", () => {
  it("should render children", () => {
    render(
      React.createElement(GlassCard, null,
        React.createElement("p", null, "Test content")
      )
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render title as h2 when provided", () => {
    render(
      React.createElement(GlassCard, { title: "Test Title" },
        React.createElement("p", null, "Content")
      )
    );
    const heading = screen.getByText("Test Title");
    expect(heading.tagName).toBe("H2");
  });

  it("should not render title when not provided", () => {
    render(
      React.createElement(GlassCard, null,
        React.createElement("p", null, "Content only")
      )
    );
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("should have glass-panel class", () => {
    const { container } = render(
      React.createElement(GlassCard, null,
        React.createElement("p", null, "Styled")
      )
    );
    expect(container.querySelector(".glass-panel")).not.toBeNull();
  });
});

describe("ActionDock", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    useCarbonStore.getState().resetStore();
  });

  it("should render 4 action buttons and 1 toggle button", () => {
    render(React.createElement(ActionDock));
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(5);
  });

  it("should have aria-labels on all buttons", () => {
    render(React.createElement(ActionDock));
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn.getAttribute("aria-label")).toBeTruthy();
    }
  });

  it("should update store on quick action click", () => {
    render(React.createElement(ActionDock));
    const scoreBefore = useCarbonStore.getState().totalScore;
    const button = screen.getByLabelText(/Plant-Based Meal/i);
    fireEvent.click(button);
    const scoreAfter = useCarbonStore.getState().totalScore;
    expect(scoreAfter).toBe(scoreBefore + QUICK_ACTIONS.PLANT_MEAL.points);
  });

  it("should trigger toast on click", () => {
    render(React.createElement(ActionDock));
    const button = screen.getByLabelText(/Public Transit/i);
    fireEvent.click(button);
    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
  });

  it("should toggle custom action form and submit successfully", () => {
    render(React.createElement(ActionDock));
    const toggle = screen.getByLabelText("Switch to custom action logging");
    fireEvent.click(toggle);

    // Form inputs should be visible
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Impact Points")).toBeInTheDocument();

    // Fill the inputs
    const descInput = screen.getByLabelText("Description");
    const pointsInput = screen.getByLabelText("Impact Points");

    fireEvent.change(descInput, { target: { value: "Recycled laptops" } });
    fireEvent.change(pointsInput, { target: { value: "30" } });

    // Submit
    const form = screen.getByRole("navigation").querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    // Store state should be updated
    const state = useCarbonStore.getState();
    const lastAction = state.actionLog[state.actionLog.length - 1];
    expect(lastAction?.description).toBe("Recycled laptops");
    expect(lastAction?.points).toBe(30);
  });
});

describe("ToastContainer", () => {
  it("should render toasts from store", () => {
    useToastStore.getState().addToast("Test message", "success");
    render(React.createElement(ToastContainer));
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should have aria-live on toasts", () => {
    useToastStore.getState().addToast("Accessible toast", "info");
    render(React.createElement(ToastContainer));
    const statuses = screen.getAllByRole("status");
    expect(statuses.length).toBeGreaterThan(0);
  });
});

describe("HeroScore", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    useCarbonStore.getState().resetStore();
  });

  it("should render the heading and score elements", () => {
    render(React.createElement(HeroScore));
    expect(screen.getByText("Monthly Carbon Score")).toBeInTheDocument();
    expect(screen.getByText("of target", { exact: false })).toBeInTheDocument();
  });

  it("should render the SVG progress ring", () => {
    render(React.createElement(HeroScore));
    const svg = screen.getByRole("img");
    expect(svg).toBeInTheDocument();
  });
});

describe("StatsRow", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    useCarbonStore.getState().resetStore();
  });

  it("should render quick stats heading", () => {
    render(React.createElement(StatsRow));
    expect(screen.getByText("Quick Stats")).toBeInTheDocument();
  });

  it("should render stat labels", () => {
    render(React.createElement(StatsRow));
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
    expect(screen.getByText("Best Streak")).toBeInTheDocument();
    expect(screen.getByText("Left to Goal")).toBeInTheDocument();
  });
});

describe("NudgeFeed", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    useCarbonStore.getState().resetStore();
  });

  it("should render nudge cards", () => {
    render(React.createElement(NudgeFeed));
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
  });

  it("should have aria-labels on nudge cards", () => {
    render(React.createElement(NudgeFeed));
    const articles = screen.getAllByRole("article");
    for (const article of articles) {
      expect(article.getAttribute("aria-label")).toBeTruthy();
    }
  });
});

describe("App structure", () => {
  it("should export a default component", async () => {
    const module = await import("../../App");
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });
});

describe("Accessibility requirements", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("SkipLink should target main content", () => {
    render(React.createElement(SkipLink));
    const link = screen.getByText("Skip to main content");
    expect(link.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
  });

  it("Header should render exactly one h1", () => {
    render(React.createElement(Header));
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("Dashboard");
  });

  it("ActionDock should render as navigation landmark", () => {
    render(React.createElement(ActionDock));
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });

  it("all action buttons should be keyboard accessible", () => {
    render(React.createElement(ActionDock));
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn.getAttribute("type")).toBe("button");
    }
  });

  it("HeroScore SVG should have aria role", () => {
    render(React.createElement(HeroScore));
    const img = screen.getByRole("img");
    expect(img.getAttribute("aria-label")).toBeTruthy();
  });
});
