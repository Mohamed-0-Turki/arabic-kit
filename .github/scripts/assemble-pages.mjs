import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";

const out = ".pages-out";
const site = ["index.html", "style.css", "playground.js"];

for (const file of [...site, "dist/index.js"]) {
  try {
    await access(file);
  } catch {
    throw new Error(`Missing ${file}. Run "npm run build" first.`);
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of site) {
  await cp(file, `${out}/${file}`);
}

await cp("dist", `${out}/dist`, { recursive: true });
await writeFile(`${out}/.nojekyll`, "");

console.log(`Assembled ${out}/: ${site.join(", ")}, dist/, .nojekyll`);
