import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed as a static export on GitHub Pages: the 5at4am/5at4am.github.io
  // repo serves the root of `site/`, which `npm run build:site` fills from the
  // `out/` directory this produces.
  //
  // There is deliberately no `headers()` rule here. Headers are an unsupported
  // feature under `output: "export"` and are silently dropped from the export,
  // so a CORS rule for the sandboxed sketchbook iframe would only ever work in
  // `next dev`. The iframe is served same-origin in the export instead.
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