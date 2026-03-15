import { describe, it, expect } from "vitest";
import React from "react";

// Mock framer-motion to avoid import issues
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("div", props, children),
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("section", props, children),
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("span", props, children),
    h2: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("h2", props, children),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("p", props, children),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { current: 0 } }),
  useTransform: () => 0,
}));

import { render, screen } from "@testing-library/react";

describe("FAQ component", () => {
  it("can be imported", async () => {
    // Test that FAQ module exists and has valid exports
    const faqModule = await import("@/components/FAQ");
    expect(faqModule).toBeDefined();
  });
});

describe("JsonLd component", () => {
  it("renders script tag with JSON-LD", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const data = { "@context": "https://schema.org", "@type": "Organization", name: "Test" };

    const { container } = render(React.createElement(JsonLd, { data }));
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
  });

  it("renders multiple scripts for array data", async () => {
    const { JsonLd } = await import("@/components/JsonLd");
    const data = [
      { "@type": "Organization", name: "Org" },
      { "@type": "BreadcrumbList" },
    ];

    const { container } = render(React.createElement(JsonLd, { data }));
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(2);
  });
});
