#!/usr/bin/env node
/**
 * Merge translation chunks into a catalog module.
 *   node scripts/i18n-merge.mjs <code>
 * Reads editors/quit-journey-editor/i18n/work/<code>/*.json (objects of id → text), keeps only ids
 * that exist in source/en.json, and writes i18n/messages/<code>.ts sorted by id.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const code = process.argv[2];
if (!code) {
  console.error("usage: node scripts/i18n-merge.mjs <locale>");
  process.exit(1);
}
const base = "editors/quit-journey-editor/i18n";
const en = JSON.parse(readFileSync(join(base, "source/en.json"), "utf8"));
const dir = join(base, "work", code);
const merged = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  Object.assign(merged, JSON.parse(readFileSync(join(dir, file), "utf8")));
}
const unknown = Object.keys(merged).filter((k) => !(k in en));
const missing = Object.keys(en).filter((k) => !(k in merged));
const sorted = Object.fromEntries(Object.keys(merged).filter((k) => k in en).sort().map((k) => [k, merged[k]]));
const body = JSON.stringify(sorted, null, 2);
writeFileSync(
  join(base, "messages", `${code}.ts`),
  `/* ${code}: AI translation of source/en.json — needs review by a native speaker before release. */\nconst messages: Record<string, string> = ${body};\n\nexport default messages;\n`,
);
console.log(JSON.stringify({ code, written: Object.keys(sorted).length, total: Object.keys(en).length, missing: missing.length, unknown }));
