import { cp, mkdir, rm, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "site");
const dest = resolve(root, "dist");

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(source, dest, { recursive: true });

const required = [
  "index.html",
  "catalog.json",
  "demos/pipeline-studio/index.html",
];

for (const file of required) {
  await access(resolve(dest, file));
}

console.log(`Built ${required.length} required artifacts into dist/`);
