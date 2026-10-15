import type { Exclusion, NaloxoneKit } from "document-models/quit-journey/v1";
import {
  exclusionStatuses,
  HELPLINES,
  helplinesFor,
  localDateKey,
  naloxoneStatuses,
  PROTECTION_LINKS,
  protectionLinksFor,
  shiftDateKey,
  SUPPLY_ALERTS,
  supplyAlertsFor,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState } from "./helpers.js";

const NOW = new Date(2026, 9, 15, 12).getTime();
const TODAY = localDateKey(NOW);
const inDays = (n: number) => shiftDateKey(TODAY, n);

describe("naloxoneStatuses", () => {
  const kit = (id: string, expiresOn: string | null, usedAt: string | null = null): NaloxoneKit => ({
    id,
    kind: "NASAL_SPRAY_4MG",
    addedAt: "2026-01-01T00:00:00.000Z",
    expiresOn,
    location: null,
    usedAt,
  });

  it("classifies kits by days to expiry", () => {
    const state = makeState({
      naloxoneKits: [
        kit("ok", inDays(61)),
        kit("soon", inDays(60)),
        kit("today", inDays(0)),
        kit("gone", inDays(-1)),
        kit("used", inDays(-5), "2026-10-01T00:00:00.000Z"),
        kit("undated", null),
      ],
    });
    expect(naloxoneStatuses(state, NOW)).toEqual([
      { kitId: "ok", daysToExpiry: 61, state: "OK" },
      { kitId: "soon", daysToExpiry: 60, state: "EXPIRING" },
      { kitId: "today", daysToExpiry: 0, state: "EXPIRING" },
      { kitId: "gone", daysToExpiry: -1, state: "EXPIRED" },
      { kitId: "used", daysToExpiry: -5, state: "USED" },
      { kitId: "undated", daysToExpiry: null, state: "OK" },
    ]);
  });

  it("uses the local day even late at night", () => {
    const late = new Date(2026, 9, 15, 23, 59).getTime();
    const state = makeState({ naloxoneKits: [kit("k", inDays(1))] });
    expect(naloxoneStatuses(state, late)[0].daysToExpiry).toBe(1);
    expect(naloxoneStatuses(makeState(), NOW)).toEqual([]);
  });
});

describe("exclusionStatuses", () => {
  const ex = (id: string, endDate: string | null): Exclusion => ({ id, scheme: "GAMSTOP", startDate: inDays(-100), endDate, note: null });

  it("classifies exclusions by days left", () => {
    const state = makeState({ exclusions: [ex("a", inDays(15)), ex("b", inDays(14)), ex("c", inDays(0)), ex("d", inDays(-1)), ex("e", null)] });
    expect(exclusionStatuses(state, NOW)).toEqual([
      { exclusionId: "a", daysLeft: 15, state: "ACTIVE" },
      { exclusionId: "b", daysLeft: 14, state: "ENDING_SOON" },
      { exclusionId: "c", daysLeft: 0, state: "ENDING_SOON" },
      { exclusionId: "d", daysLeft: -1, state: "ENDED" },
      { exclusionId: "e", daysLeft: null, state: "OPEN_ENDED" },
    ]);
  });
});

describe("supply alerts, protection links and helplines", () => {
  it("dates and sources every alert", () => {
    expect(SUPPLY_ALERTS.map((a) => a.key)).toEqual(["medetomidine", "xylazine-wounds", "nitazenes", "fentanyl-in-stimulants", "negative-strip"]);
    for (const a of SUPPLY_ALERTS) {
      expect(a.reviewedOn).toBe("2026-10-15");
      expect(a.source).toMatch(/^https:\/\//);
      expect(a.body.length).toBeLessThan(400);
    }
  });

  it("filters alerts by product", () => {
    expect(supplyAlertsFor("OPIOIDS").map((a) => a.key)).toEqual(["medetomidine", "xylazine-wounds", "nitazenes", "negative-strip"]);
    expect(supplyAlertsFor("STIMULANTS").map((a) => a.key)).toEqual(["nitazenes", "fentanyl-in-stimulants", "negative-strip"]);
    expect(supplyAlertsFor("CIGARETTES")).toEqual([]);
  });

  it("offers protection tools per product", () => {
    expect(protectionLinksFor("GAMBLING").map((l) => l.key)).toEqual(["gamstop", "oasis", "betblocker", "gamban", "bank-blocks", "smart-recovery"]);
    expect(protectionLinksFor("OPIOIDS").map((l) => l.key)).toContain("never-use-alone");
    expect(protectionLinksFor("ALCOHOL").map((l) => l.key)).toEqual(["aa-meeting-guide", "smart-recovery"]);
    for (const l of PROTECTION_LINKS) expect(l.url).toMatch(/^https:\/\//);
    expect(new Set(PROTECTION_LINKS.map((l) => l.key)).size).toBe(PROTECTION_LINKS.length);
  });

  it("lists verified helplines per product", () => {
    const phone = Object.fromEntries(HELPLINES.map((h) => [h.key, h.phone]));
    expect(phone).toMatchObject({
      samhsa: "1-800-662-4357",
      "988": "988",
      frank: "0300 123 6600",
      "uk-gambling": "0808 8020 133",
      "de-sucht-drogen": "01806 313031",
      "de-gambling": "0800 1 37 27 00",
      "nhs-smokefree": "0300 123 1044",
      "never-use-alone": "800-484-3731",
      nors: "1-888-688-6677",
    });
    expect(helplinesFor("GAMBLING").map((h) => h.key)).toEqual(["samhsa", "988", "uk-gambling", "us-gambling", "de-gambling"]);
    expect(helplinesFor("VAPE").map((h) => h.key)).toEqual(["samhsa", "988", "nhs-smokefree"]);
    expect(helplinesFor("OPIOIDS").map((h) => h.key)).toContain("nors");
    expect(helplinesFor("SUGAR").map((h) => h.key)).toEqual(["samhsa", "988"]);
  });
});
