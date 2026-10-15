/// <reference types="vite/client" />
import { parse, TYPE, type MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildContentCatalog } from "./catalog.js";
import { LOCALES, resolveLocale } from "./locales.js";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const UI_SOURCE = here("./source/ui.en.json");
const EN_SOURCE = here("./source/en.json");

const catalogs: Partial<Record<string, { default: Record<string, string> }>> = import.meta.glob<{ default: Record<string, string> }>("./messages/*.ts", { eager: true });

/** Content strings are looked up raw (no ICU), except these templates which use placeholders. */
const isIcu = (id: string) => !id.startsWith("content.") && !id.startsWith("enum.") || /^content\.badge\..*\.description$/.test(id);

function argNames(elements: MessageFormatElement[], out = new Set<string>()): Set<string> {
  for (const el of elements) {
    if (el.type === TYPE.argument || el.type === TYPE.number || el.type === TYPE.date || el.type === TYPE.time) out.add(el.value);
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      out.add(el.value);
      for (const option of Object.values(el.options)) argNames(option.value, out);
    }
    if (el.type === TYPE.tag) {
      out.add(`<${el.value}>`);
      argNames(el.children, out);
    }
  }
  return out;
}

function source(): Record<string, string> {
  const ui = existsSync(UI_SOURCE) ? (JSON.parse(readFileSync(UI_SOURCE, "utf8")) as Record<string, string>) : {};
  const all = { ...ui, ...buildContentCatalog() };
  return Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
}

describe("i18n", () => {
  const en = source();

  it("writes the English source catalog when asked", () => {
    if (process.env.WRITE_I18N) {
      writeFileSync(here("./source/content.en.json"), `${JSON.stringify(buildContentCatalog(), null, 2)}\n`);
      writeFileSync(EN_SOURCE, `${JSON.stringify(en, null, 2)}\n`);
    }
    expect(Object.keys(en).length).toBeGreaterThan(0);
  });

  it("has 50 unique locales with a catalog for every non-English one", () => {
    expect(new Set(LOCALES.map((l) => l.code)).size).toBe(50);
    for (const l of LOCALES.filter((x) => x.code !== "en")) expect(catalogs[`./messages/${l.code}.ts`], l.code).toBeDefined();
  });

  it("resolves device languages to supported locales", () => {
    expect(resolveLocale(["de-AT", "en"])).toBe("de");
    expect(resolveLocale(["zh-TW"])).toBe("zh-Hant");
    expect(resolveLocale(["zh-HK"])).toBe("yue");
    expect(resolveLocale(["zh-CN"])).toBe("zh-Hans");
    expect(resolveLocale(["tl-PH"])).toBe("fil");
    expect(resolveLocale(["xx", "pt-BR"])).toBe("pt");
    expect(resolveLocale(["xx"])).toBe("en");
  });

  it("English source messages are valid ICU", () => {
    for (const [id, text] of Object.entries(en)) if (isIcu(id)) expect(() => parse(text), id).not.toThrow();
  });

  for (const l of LOCALES.filter((x) => x.code !== "en")) {
    it(`${l.code} catalog is consistent with the English source`, () => {
      const messages = catalogs[`./messages/${l.code}.ts`]?.default ?? {};
      const problems: string[] = [];
      for (const [id, text] of Object.entries(messages)) {
        if (!(id in en)) {
          problems.push(`unknown key ${id}`);
          continue;
        }
        if (text.trim() === "") problems.push(`empty ${id}`);
        if (!isIcu(id)) continue;
        try {
          const want = [...argNames(parse(en[id]))].sort().join(",");
          const got = [...argNames(parse(text))].sort().join(",");
          if (want !== got) problems.push(`${id}: placeholders {${got}} ≠ {${want}}`);
        } catch (e) {
          problems.push(`${id}: invalid ICU (${String(e)})`);
        }
      }
      if (process.env.I18N_STRICT) {
        const missing = Object.keys(en).filter((id) => !(id in messages));
        if (missing.length) problems.push(`${missing.length} missing keys, e.g. ${missing.slice(0, 3).join(", ")}`);
      }
      expect(problems, l.code).toEqual([]);
    });
  }
});
