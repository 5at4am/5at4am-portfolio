import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `site/` is the static export committed for the Pages deploy (see
    // scripts/build-site.mjs). It is generated, minified, third-party code —
    // linting it reports thousands of problems in code we did not write.
    "site/**",
    // Vendored third-party agent skills, not project source.
    ".agents/**",
  ]),
  {
    // `src/shaders` holds vendored ThreeUI sources kept byte-for-byte against
    // their published SHA-256 digests, so they are not ours to refactor. The
    // authored `ThreeDPaper` resets its own ready state from an effect, which
    // the React Compiler lint flags; the host components under
    // `src/components` still get the rule.
    files: ["src/shaders/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
