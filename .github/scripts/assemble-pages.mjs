import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const out = ".pages-out";

const required = [
  "dist/index.js",
  "playground/index.html",
  "playground/playground.js",
  "public/404.html",
];

for (const file of required) {
  try {
    await access(file);
  } catch {
    throw new Error(`Missing ${file}. Run "npm run build" first.`);
  }
}

/* The page is authored in playground/, where the built package sits at
   ../dist/. It is published at the site root, where it sits at ./dist/.
   Rewriting the import map target is the only path that differs, and the
   replacement is asserted so a renamed or duplicated map fails loudly. */
const SOURCE_MAP_TARGET = '"arabic-kit": "../dist/index.js"';
const SITE_MAP_TARGET = '"arabic-kit": "./dist/index.js"';

const page = await readFile("playground/index.html", "utf8");
const occurrences = page.split(SOURCE_MAP_TARGET).length - 1;

if (occurrences !== 1) {
  throw new Error(
    `Expected exactly one ${SOURCE_MAP_TARGET} in playground/index.html, found ${occurrences}.`,
  );
}

if (page.includes("/playground/")) {
  throw new Error(
    "playground/index.html still contains an absolute /playground/ URL.",
  );
}

const root = page.replace(SOURCE_MAP_TARGET, SITE_MAP_TARGET);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await cp("dist", `${out}/dist`, { recursive: true });
await writeFile(`${out}/index.html`, root);
await cp("playground/playground.js", `${out}/playground.js`);
await cp("public/404.html", `${out}/404.html`);
await writeFile(`${out}/.nojekyll`, "");

console.log(
  `Assembled ${out}/: index.html (playground), playground.js, dist/, 404.html, .nojekyll`,
);
