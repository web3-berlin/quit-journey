import type { AssessmentInstrument } from "document-models/quit-journey/v1";
import {
  ASSESSMENT_SHAPES,
  ASSESSMENTS,
  assessmentFor,
  availableAssessments,
  recordAssessment,
  reducer,
  scoreAssessment,
  SUBSTANCE_GROUPS,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

/** The reducer's [items, min, max] table, restated independently. */
const REDUCER_SHAPE: Record<AssessmentInstrument, [number, number, number]> = {
  AUDIT_C: [3, 0, 4],
  AUDIT: [10, 0, 4],
  HSI: [2, 0, 3],
  CUDIT_R: [8, 0, 4],
  PGSI: [9, 0, 3],
  BARC_10: [10, 1, 6],
  SOWS: [16, 0, 4],
  SAWS: [10, 0, 3],
  CWS: [19, 0, 10],
  ACSA: [16, 0, 4],
};
const INSTRUMENTS = Object.keys(REDUCER_SHAPE) as AssessmentInstrument[];
const ALL = SUBSTANCE_GROUPS.flatMap((g) => g.keys);

/** Deterministic pseudo-random valid answers. */
function answersFor(instrument: AssessmentInstrument, seed: number): number[] {
  const [count, min, max] = REDUCER_SHAPE[instrument];
  return Array.from({ length: count }, (_, i) => min + ((seed * 7 + i * 13) % (max - min + 1)));
}

describe("assessment definitions", () => {
  it("covers all 10 instruments exactly once and matches the reducer shape", () => {
    expect(ASSESSMENTS.map((a) => a.instrument).sort()).toEqual([...INSTRUMENTS].sort());
    expect(ASSESSMENT_SHAPES).toEqual(REDUCER_SHAPE);
    for (const def of ASSESSMENTS) {
      const [count, min, max] = REDUCER_SHAPE[def.instrument];
      expect(def.items, def.instrument).toHaveLength(count);
      for (const item of def.items) {
        expect(item.options.length).toBeGreaterThan(0);
        for (const o of item.options) {
          expect(Number.isInteger(o.value)).toBe(true);
          expect(o.value).toBeGreaterThanOrEqual(min);
          expect(o.value).toBeLessThanOrEqual(max);
          expect(o.label).not.toBe("");
        }
      }
    }
  });

  it("licenses only AUDIT, AUDIT-C, SOWS and CWS, with real wording", () => {
    const licensed = ASSESSMENTS.filter((a) => a.licensed).map((a) => a.instrument).sort();
    expect(licensed).toEqual(["AUDIT", "AUDIT_C", "CWS", "SOWS"]);
    for (const def of ASSESSMENTS) {
      expect(def.citation.length).toBeGreaterThan(20);
      if (def.licensed) expect(def.items.every((i) => i.text.length > 0)).toBe(true);
      else expect(def.items.every((i) => i.text === "")).toBe(true);
    }
  });

  it("uses the verbatim WHO wording and scoring for AUDIT", () => {
    const audit = assessmentFor("AUDIT");
    expect(audit.items[0].text).toBe("How often do you have a drink containing alcohol?");
    expect(audit.items[2].text).toBe("How often do you have six or more drinks on one occasion?");
    expect(audit.items[1].options.map((o) => o.label)).toEqual(["1 or 2", "3 or 4", "5 or 6", "7, 8, or 9", "10 or more"]);
    expect(audit.items[9].options).toEqual([
      { value: 0, label: "No" },
      { value: 2, label: "Yes, but not in the last year" },
      { value: 4, label: "Yes, during the last year" },
    ]);
    expect(assessmentFor("AUDIT_C").items.map((i) => i.text)).toEqual(audit.items.slice(0, 3).map((i) => i.text));
  });

  it("uses the published SOWS and CWS items", () => {
    const sows = assessmentFor("SOWS");
    expect(sows.items[0].text).toBe("I feel anxious");
    expect(sows.items[15].text).toBe("I feel like shooting up");
    expect(sows.items[0].options.map((o) => o.label)).toEqual(["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"]);
    const cws = assessmentFor("CWS");
    expect(cws.items[0].text).toBe("The only thing I could think about was smoking some cannabis");
    expect(cws.items[18].text).toBe("I had hot flashes");
    expect(cws.items[0].options).toHaveLength(11);
  });

  it("has contiguous bands covering every possible score", () => {
    for (const def of ASSESSMENTS) {
      const [count, min, max] = REDUCER_SHAPE[def.instrument];
      const bands = [...def.bands].sort((a, b) => a.min - b.min);
      expect(bands[0].min, def.instrument).toBe(count * min);
      expect(bands[bands.length - 1].max, def.instrument).toBe(count * max);
      for (let i = 1; i < bands.length; i++) expect(bands[i].min).toBe(bands[i - 1].max + 1);
    }
  });

  it("targets the right journeys and retake intervals", () => {
    expect(assessmentFor("AUDIT").appliesTo).toEqual(["ALCOHOL"]);
    expect(assessmentFor("SAWS").appliesTo).toEqual(["ALCOHOL"]);
    expect(assessmentFor("SOWS").appliesTo.sort()).toEqual(["KRATOM", "OPIOIDS"]);
    expect(assessmentFor("CWS").appliesTo).toEqual(["CANNABIS"]);
    expect(assessmentFor("CUDIT_R").appliesTo).toEqual(["CANNABIS"]);
    expect(assessmentFor("HSI").appliesTo.sort()).toEqual(["CIGARETTES", "CIGARS", "ROLL_YOUR_OWN"]);
    expect(assessmentFor("PGSI").appliesTo).toEqual(["GAMBLING"]);
    expect(assessmentFor("ACSA").appliesTo).toEqual(["STIMULANTS"]);
    expect([...assessmentFor("BARC_10").appliesTo].sort()).toEqual([...ALL].sort());
    for (const def of ASSESSMENTS) expect(def.retakeDays).toBe(def.kind === "WITHDRAWAL" ? 1 : 30);
  });

  it("hides unlicensed instruments unless enabled", () => {
    expect(availableAssessments("ALCOHOL").map((a) => a.instrument)).toEqual(["AUDIT", "AUDIT_C"]);
    expect(availableAssessments("ALCOHOL", true).map((a) => a.instrument)).toEqual(["AUDIT", "AUDIT_C", "BARC_10", "SAWS"]);
    expect(availableAssessments("GAMBLING")).toEqual([]);
    expect(availableAssessments("GAMBLING", true).map((a) => a.instrument)).toEqual(["PGSI", "BARC_10"]);
    expect(() => assessmentFor("NOPE" as AssessmentInstrument)).toThrow();
  });
});

describe("scoreAssessment", () => {
  it("matches the RECORD_ASSESSMENT reducer score for every instrument", () => {
    let doc = utils.createDocument();
    const expected: { instrument: AssessmentInstrument; answers: number[] }[] = [];
    INSTRUMENTS.forEach((instrument, i) => {
      for (let seed = 0; seed < 3; seed++) {
        const answers = answersFor(instrument, seed + i);
        expected.push({ instrument, answers });
        doc = reducer(
          doc,
          recordAssessment({ id: `a-${instrument}-${seed}`, instrument, answers, takenAt: "2026-10-01T10:00:00.000Z" }),
        );
      }
    });
    expect(doc.operations.global.every((o) => !o.error)).toBe(true);
    const stored = doc.state.global.assessments ?? [];
    expect(stored).toHaveLength(expected.length);
    stored.forEach((a, i) => {
      expect(scoreAssessment(a.instrument, expected[i].answers).score).toBe(a.score);
    });
  });

  it("looks up AUDIT bands at the standard cut-offs", () => {
    const at = (score: number) => {
      const answers = Array<number>(10).fill(0);
      let left = score;
      for (let i = 0; i < 10 && left > 0; i++) {
        answers[i] = Math.min(4, left);
        left -= answers[i];
      }
      return scoreAssessment("AUDIT", answers);
    };
    expect(at(0).band?.label).toBe("Lower risk");
    expect(at(7).band?.label).toBe("Lower risk");
    expect(at(8).band?.label).toBe("Increasing risk");
    expect(at(15).band?.label).toBe("Increasing risk");
    expect(at(16).band?.label).toBe("Higher risk");
    expect(at(19).band?.level).toBe("high");
    expect(at(20).band?.label).toBe("Highest risk");
    expect(at(40).maxScore).toBe(40);
    expect(at(40).redFlag).toBe(false);
  });

  it("uses a single neutral >= 4 band for AUDIT-C", () => {
    expect(scoreAssessment("AUDIT_C", [1, 1, 1]).band?.level).toBe("low");
    expect(scoreAssessment("AUDIT_C", [2, 1, 1]).band?.label).toBe("Increasing risk");
    expect(scoreAssessment("AUDIT_C", [4, 4, 4]).band?.max).toBe(12);
  });

  it("raises a red flag only for the highest withdrawal bands", () => {
    const sows = (total: number) => {
      const a = Array<number>(16).fill(0);
      for (let i = 0; i < total; i++) a[i % 16] += 1;
      return scoreAssessment("SOWS", a);
    };
    expect(sows(0).band?.label).toBe("No symptoms");
    expect(sows(10).band?.label).toBe("Mild withdrawal");
    expect(sows(11).band?.label).toBe("Moderate withdrawal");
    expect(sows(20).redFlag).toBe(false);
    expect(sows(21).band?.label).toBe("Severe withdrawal");
    expect(sows(21).redFlag).toBe(true);
    expect(sows(64).maxScore).toBe(64);

    expect(scoreAssessment("SAWS", Array<number>(10).fill(1)).redFlag).toBe(false);
    expect(scoreAssessment("SAWS", [3, 3, 3, 3, 0, 0, 0, 0, 0, 0]).redFlag).toBe(true);
    expect(scoreAssessment("CWS", Array<number>(19).fill(5)).redFlag).toBe(true);
    expect(scoreAssessment("CWS", Array<number>(19).fill(2)).redFlag).toBe(false);
    expect(scoreAssessment("ACSA", Array<number>(16).fill(2)).redFlag).toBe(true);
    // A high screening band is never a red flag.
    expect(scoreAssessment("PGSI", Array<number>(9).fill(3)).band?.level).toBe("high");
    expect(scoreAssessment("PGSI", Array<number>(9).fill(3)).redFlag).toBe(false);
  });

  it("returns no band for an out-of-range score", () => {
    expect(scoreAssessment("BARC_10", [0]).band).toBeNull();
  });
});
