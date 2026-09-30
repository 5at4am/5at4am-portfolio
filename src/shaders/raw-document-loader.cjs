/**
 * Turbopack loader that returns a file's contents as a JavaScript module.
 *
 * The vendored ThreeUI 3D Paper documents in `./3d-paper/sources` are authored
 * as complete HTML files and are imported as strings by `ThreeDPaper.tsx`
 * (`./sources/3d-paper.html?raw`) so they can be mounted verbatim in an iframe
 * `srcDoc`. Turbopack has no built-in `?raw` query and its `raw` module type
 * resolves these documents to `undefined`, so the rule in `next.config.ts`
 * points at this loader instead. It is the equivalent of `raw-loader`, written
 * locally so the project does not take a dependency for four files.
 *
 * The documents are kept byte-for-byte against their published SHA-256
 * digests, so this loader only ever serialises; it never transforms the text.
 */
module.exports = function rawDocumentLoader(source) {
  const text = typeof source === "string" ? source : source.toString("utf8");
  return `export default ${JSON.stringify(text)};\n`;
};
