/**
 * Ambient declarations for Turbopack module types configured in
 * `next.config.ts`.
 *
 * `src/shaders/3d-paper/ThreeDPaper.tsx` imports the vendored ThreeUI 3D Paper
 * documents as raw strings (`./sources/3d-paper.html?raw`) and mounts them
 * verbatim in an iframe `srcDoc`. The `raw` module type is enabled for those
 * exact files by a `turbopack.rules` entry; TypeScript needs to be told that
 * the specifier resolves to a string.
 */
declare module "*?raw" {
  const content: string;
  export default content;
}
