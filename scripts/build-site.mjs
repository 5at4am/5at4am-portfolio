/**
 * Regenerate `site/` from the Next.js static export, then publish the result.
 *
 * `site/` is the payload that `.github/workflows/publish-site.yml` mirrors into
 * the 5at4am/5at4am.github.io Pages repo. It used to be a hand-written static
 * page committed alongside a full Next.js export published by hand, so the two
 * diverged and the live site was serving something this repo could not
 * reproduce. Now there is exactly one source of truth: `out/`, produced by
 * `next build` under `output: "export"`.
 *
 * The directory is replaced wholesale rather than merged. A mirror that only
 * adds files cannot remove a route that was deleted from the app, which would
 * leave a stale page deployed at its old URL forever.
 *
 * Cross-platform (no shell) because this runs on Windows locally and on
 * ubuntu-latest in Actions.
 */

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const siteDir = path.join(root, "site");

/** GitHub Pages needs this to serve paths containing an underscore. */
const NOJEKYLL = "";
const EXPECTED_DOMAIN = "5at4am.me";

async function main() {
  if (!existsSync(path.join(outDir, "index.html"))) {
    throw new Error(
      `out/index.html not found. Run "next build" with output: "export" first.`,
    );
  }

  await rm(siteDir, { recursive: true, force: true });
  await mkdir(siteDir, { recursive: true });
  await cp(outDir, siteDir, { recursive: true });

  // `public/CNAME` lands in `out/` on its own, but re-assert it here so the
  // custom domain survives even if someone drops that file from `public/`.
  const cname = path.join(siteDir, "CNAME");
  const cnameDomain = (await readFile(cname, "utf8")).trim();
  if (cnameDomain !== EXPECTED_DOMAIN) {
    await writeFile(cname, `${EXPECTED_DOMAIN}\n`);
    console.warn(`site/CNAME was "${cnameDomain}"; reset to ${EXPECTED_DOMAIN}.`);
  }

  await writeFile(path.join(siteDir, ".nojekyll"), NOJEKYLL);

  // GitHub Pages serves `/profile` by looking for `profile.html` then
  // `profile/index.html`. The export emits `profile.html` with the default
  // `trailingSlash: false`, which Pages resolves, so nothing to rewrite. The
  // entry file just has to stay lowercase or Pages 404s on it.
  const entries = ["index.html", "profile.html", "paper.html"];
  for (const entry of entries) {
    if (!existsSync(path.join(siteDir, entry))) {
      console.warn(`warning: expected ${entry} in the export, but it is missing.`);
    }
    if (entry !== entry.toLowerCase()) {
      throw new Error(`${entry} must be lowercase; GitHub Pages 404s otherwise.`);
    }
  }

  console.log(`site/ regenerated from ${path.relative(root, outDir)}.`);
}

await main();