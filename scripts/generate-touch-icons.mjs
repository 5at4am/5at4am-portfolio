import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Generates `public/apple-touch-icon.png` (180x180) from `public/icon.svg`.
 *
 * Why a script rather than a committed PNG: the icon is one rectangle and one
 * line of mono text, so hand-tuning a raster of it would drift from the SVG the
 * rest of the site uses, and every future change to the wordmark would mean
 * re-exporting a binary. Chrome renders the SVG headlessly, so the PNG is a
 * build artefact of the SVG rather than a second source of truth.
 *
 * Run it only when the icon changes. The output IS committed, because a static
 * export has no build step on the server that could run this on demand.
 *
 * Usage: node scripts/generate-touch-icons.mjs
 */

const OUT_DIR = join(process.cwd(), "public");
const ICON = join(OUT_DIR, "icon.svg");
const OUT = join(OUT_DIR, "apple-touch-icon.png");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const chrome = CHROME_CANDIDATES.find((candidate) => {
  const probe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
  return probe.status === 0;
});

if (!chrome) {
  console.error(
    "No Chrome or Chromium found. Install one, or produce a 180x180 apple-touch-icon.png by hand and place it at public/apple-touch-icon.png.",
  );
  process.exit(1);
}

const svg = readFileSync(ICON, "utf8");

// Chrome's --screenshot renders a data: URL. The SVG is inlined because a
// file:// URL in a headless screenshot needs --allow-file-access-from-files,
// and because this keeps the script to a single process with no temp directory.
const html = `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  /* 180x180 with the icon filling it exactly: the manifest declares this size,
     so any padding here would be baked into the declared box. */
  svg { display: block; width: 180px; height: 180px; }
</style>
${svg}`;

const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

const result = spawnSync(
  chrome,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--hide-scrollbars",
    "--window-size=180,180",
    `--screenshot=${OUT}`,
    url,
  ],
  { encoding: "utf8" },
);

if (result.status !== 0) {
  console.error(result.stderr || "screenshot failed");
  process.exit(1);
}

try {
  const bytes = readFileSync(OUT);
  // PNG magic number: if this is not present the screenshot wrote something else.
  const isPng =
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (!isPng) {
    console.error("screenshot did not produce a PNG");
    process.exit(1);
  }
  console.log(`wrote ${OUT} (${bytes.length} bytes)`);
} catch {
  console.error(`screenshot reported success but ${OUT} is missing`);
  process.exit(1);
}