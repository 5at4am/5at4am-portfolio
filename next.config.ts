import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async headers() {
    return [
      {
        // The ThreeUI sketchbook document is mounted in a sandboxed iframe with an
        // opaque origin, so its @font-face requests are CORS restricted. Serving the
        // assets with a wildcard origin keeps the authored fonts loading.
        source: "/sketchbook/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
