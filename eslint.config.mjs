import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase's convention for discarding a destructured field is
      // `const { field: _field, ...rest } = obj` — an underscore prefix
      // marks it deliberate, same as unused function params.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The agent harness keeps its worktrees here — a second full checkout of this repo,
    // nested inside it. Flat config walks dot-directories, so one appearing turns the
    // lint gate red with hundreds of errors from another branch's code. #125 taught the
    // test guards and vitest the same thing and missed this third door.
    ".claude/**",
  ]),
]);

export default eslintConfig;
