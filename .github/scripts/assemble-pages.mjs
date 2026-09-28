import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";

const out = ".pages-out";
const path = "playground/";

const required = [
  "dist/index.js",
  `${path}index.html`,
  `${path}playground.js`,
  "public/404.html",
];

for (const file of required) {
  try {
    await access(file);
  } catch {
    throw new Error(`Missing ${file}. Run "npm run build" first.`);
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(`${out}/${path}`, { recursive: true });

await cp("dist", `${out}/dist`, { recursive: true });
await cp(`${path}index.html`, `${out}/${path}index.html`);
await cp(`${path}playground.js`, `${out}/${path}playground.js`);
await cp("public/404.html", `${out}/404.html`);
await cp("public/404.html", `${out}/index.html`);
await writeFile(`${out}/.nojekyll`, "");

console.log(
  `Assembled ${out}/: dist/, ${path}, index.html, 404.html, .nojekyll`,
);
