import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Generates the committed PNG icons from `public/icon.svg`:
 *   - public/apple-touch-icon.png (180x180)
 *   - public/icon-192.png (192x192)
 *   - public/icon-512.png (512x512)
 *
 * Why a script rather than committed PNGs: the icon is one rectangle and one
 * line of mono text, so hand-tuning rasters of it would drift from the SVG the
 * rest of the site uses, and every future change to the wordmark would mean
 * re-exporting binaries. Chrome renders the SVG headlessly, so the PNGs are
 * build artefacts of the SVG rather than a second source of truth.
 *
 * Run it only when the icon changes. The output IS committed, because a static
 * export has no build step on the server that could run this on demand.
 *
 * Usage: node scripts/generate-touch-icons.mjs
 */

const OUT_DIR = join(process.cwd(), "public");
const ICON = join(OUT_DIR, "icon.svg");
const OUTPUTS = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

// File existence is enough on every supported platform. The previous
// `chrome --version` probe launched a visible browser on Windows because the
// flag is not a version command there.
const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error(
    "No Chrome or Chromium found. Install one, or produce the PNG icons by hand and place them in public/.",
  );
  process.exit(1);
}

const svg = readFileSync(ICON, "utf8");

for (const { file, size } of OUTPUTS) {
  const out = join(OUT_DIR, file);

  // Chrome's --screenshot renders a data: URL. The SVG is inlined because a
  // file:// URL in a headless screenshot needs --allow-file-access-from-files,
  // and because this keeps the script to a single process with no temp directory.
  const html = `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  /* The declared size is the exported box, so any padding here would be baked
     into the icon and disagree with the size in the manifest and metadata. */
  svg { display: block; width: ${size}px; height: ${size}px; }
</style>
${svg}`;

  const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--force-device-scale-factor=1",
      "--default-background-color=00000000",
      "--hide-scrollbars",
      `--window-size=${size},${size}`,
      `--screenshot=${out}`,
      url,
    ],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.error(result.stderr || `screenshot failed for ${file}`);
    process.exit(1);
  }

  try {
    const bytes = readFileSync(out);
    // PNG magic number: if this is not present the screenshot wrote something else.
    const isPng =
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    if (!isPng) {
      console.error(`screenshot for ${file} did not produce a PNG`);
      process.exit(1);
    }

    // Read the IHDR dimensions. A window-size mismatch is silent otherwise.
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (width !== size || height !== size) {
      console.error(`${file} is ${width}x${height}, expected ${size}x${size}`);
      process.exit(1);
    }

    console.log(`wrote ${out} (${bytes.length} bytes)`);
  } catch {
    console.error(`screenshot reported success but ${out} is missing`);
    process.exit(1);
  }
}
