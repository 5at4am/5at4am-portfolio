import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed as a static export on GitHub Pages (5at4am.github.io serves the
  // root of this export). The sketchbook CORS rule below cannot exist on Pages,
  // so the iframe fonts rely on same-origin serving instead of a header rule.
  output: "export",
  turbopack: {
    rules: {
      // The vendored ThreeUI 3D Paper documents are imported as raw text by
      // `src/shaders/3d-paper/ThreeDPaper.tsx` (`./sources/*.html?raw`) and
      // mounted verbatim through an iframe `srcDoc`. Turbopack has no `?raw`
      // query of its own, so the rule is scoped by path and by query to those
      // four files only. The loader serialises and never transforms, so the
      // documents still hash to their published SHA-256 digests.
      "*.html": {
        condition: {
          all: [
            { path: /3d-paper[/\\]sources[/\\]/ },
            { query: /[?&]raw(?=&|$)/ },
          ],
        },
        loaders: [require.resolve("./src/shaders/raw-document-loader.cjs")],
        as: "*.js",
      },
    },
  },
  };

export default nextConfig;
