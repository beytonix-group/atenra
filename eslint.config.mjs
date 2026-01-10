import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// Get the extended configs separately to avoid circular reference issues
const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

const eslintConfig = [
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
  ...nextConfigs,
  {
    rules: {
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
