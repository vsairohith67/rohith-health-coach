import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "release/**",
      "test-results/**",
      "**/__pycache__/**",
      "**/.pytest_cache/**",
      "**/.ruff_cache/**",
      "**/.venv/**",
      "**/supabase/.temp/**",
      "**/supabase/.branches/**",
    ],
  },
  js.configs.recommended,
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
