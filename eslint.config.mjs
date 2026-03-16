import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Extract recommended rules from jsx-a11y (plugin already registered by next/core-web-vitals)
const a11yRules = Object.fromEntries(
  Object.entries(jsxA11y.configs.recommended.rules).map(([key, value]) => [
    key.startsWith("jsx-a11y/") ? key : `jsx-a11y/${key}`,
    value,
  ])
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...a11yRules,
      // Allow nesting pattern (label wrapping input) + custom components
      // Warn (not error) until all pages migrate to FormField component
      "jsx-a11y/label-has-associated-control": ["warn", {
        assert: "either",
        controlComponents: ["Input", "Select", "Textarea"],
        depth: 3,
      }],
      // Warn until interactive divs are refactored to buttons
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-autofocus": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
