/**
 * Verifies the vendored ThreeUI sources against the digests recorded in
 * `src/shaders/3d-paper/SOURCE.json`.
 *
 * Those files are copied byte-for-byte out of the published ThreeUI source
 * bundle and are mounted verbatim at runtime, so a stray editor, a formatter,
 * or a bad merge has to fail loudly rather than quietly changing the rendered
 * certificate, shaders, or Three.js runtime.
 *
 * Run with `npm run verify:shaders`.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "src/shaders/3d-paper/SOURCE.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const failures = [];

for (const file of manifest.files) {
  const bytes = await readFile(join(root, file.path));
  const digest = createHash("sha256").update(bytes).digest("hex");
  const ok = digest === file.sha256 && bytes.length === file.bytes;

  if (!ok) failures.push({ path: file.path, digest, bytes: bytes.length });
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${file.path}  ${digest.slice(0, 12)}  ${bytes.length} bytes`
  );
}

if (manifest.revision && !manifest.files.some((f) => f.sha256.startsWith(manifest.revision))) {
  failures.push({ path: "manifest", digest: manifest.revision, bytes: -1 });
  console.log(`FAIL  revision ${manifest.revision} is not the canonical source digest`);
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length} vendored file(s) no longer match the registered ThreeUI digests.`
  );
  process.exit(1);
}

console.log(
  `\nall ${manifest.files.length} vendored files match the registered ThreeUI digests (revision ${manifest.revision})`
);
