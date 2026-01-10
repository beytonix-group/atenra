import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "out/**",
      "dist/**",
      "coverage/**",
      ".vercel/**",
      ".turbo/**",
      "next-env.d.ts",
      "cf-env.d.ts",
      "scripts/**",
      "eslint.config.mjs",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // Global settings for all files
  {
    languageOptions: {
      globals: {
        // Node.js globals
        process: "readonly",
        console: "readonly",
        // Browser globals
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        File: "readonly",
        crypto: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        AbortController: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        // React globals
        React: "readonly",
        JSX: "readonly",
      },
    },
    rules: {
      // Allow empty catch blocks (common pattern)
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },

  // React recommended (flat config)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
    },
  },

  // React Hooks
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // JSX A11y (matching Next.js defaults - less strict)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // Next.js uses a less strict a11y config
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      // These are commonly triggered and set to off in Next.js
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/label-has-associated-control": "off",
    },
  },

  // Next.js plugin (core-web-vitals rules)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // Import plugin
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-anonymous-default-export": "warn",
    },
  },

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Disable base rules that TS handles
      "no-unused-vars": "off",
      "no-undef": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
