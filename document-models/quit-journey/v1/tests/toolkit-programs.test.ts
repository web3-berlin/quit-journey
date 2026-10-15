import type { ProgramEnrollment, ProgramKey } from "document-models/quit-journey/v1";
import {
  availablePrograms,
  completeMission,
  programDefinition,
  PROGRAMS,
  programStatus,
  reducer,
  startProgram,
  SUBSTANCE_GROUPS,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

const at = (day: number, hour = 12) => new Date(2026, 4, day, hour).getTime();
const iso = (ms: number) => new Date(ms).toISOString();
const ALL = SUBSTANCE_GROUPS.flatMap((g) => g.keys);

const enrollment = (program: ProgramKey, startedAt: number, completedMissions: string[] = [], endedAt: number | null = null): ProgramEnrollment => ({
  id: `p-${program}`,
  program,
  startedAt: iso(startedAt),
  completedMissions,
  endedAt: endedAt === null ? null : iso(endedAt),
});

describe("program definitions", () => {
  it("defines the five programs with sensible content", () => {
    expect(PROGRAMS.map((p) => p.key).sort()).toEqual(["DAILY_MISSIONS", "DRY_MONTH", "QUIT_VAPING", "SKILL_LESSONS", "T_BREAK"]);
    for (const p of PROGRAMS) {
      const keys = new Set(p.missions.map((m) => m.key));
      expect(keys.size, p.key).toBe(p.missions.length);
      expect(p.evidence.length).toBeGreaterThan(20);
      let last = 0;
      for (const m of p.missions) {
        expect(m.day).toBeGreaterThanOrEqual(Math.max(1, last));
        expect(m.day).toBeLessThanOrEqual(p.lengthDays);
        last = m.day;
        expect(m.title.split(/\s+/).length, m.title).toBeLessThanOrEqual(6);
        const sentences = m.body.split(/(?<=[.!?])\s+/).filter(Boolean).length;
        expect(sentences, m.body).toBeGreaterThanOrEqual(1);
        expect(sentences, m.body).toBeLessThanOrEqual(3);
      }
    }
  });

  it("has the requested lengths and targets", () => {
    expect(programDefinition("QUIT_VAPING").lengthDays).toBe(30);
    expect(programDefinition("QUIT_VAPING").appliesTo).toEqual(["VAPE"]);
    expect(programDefinition("DAILY_MISSIONS").missions).toHaveLength(30);
    expect(programDefinition("DAILY_MISSIONS").appliesTo.sort()).toEqual(["CIGARETTES", "CIGARS", "HEATED_TOBACCO", "ROLL_YOUR_OWN", "VAPE"]);
    expect(programDefinition("DRY_MONTH").lengthDays).toBe(31);
    expect(programDefinition("DRY_MONTH").appliesTo).toEqual(["ALCOHOL"]);
    expect(programDefinition("T_BREAK").lengthDays).toBe(28);
    expect(programDefinition("T_BREAK").evidence).toContain("Hirvonen");
    const skills = programDefinition("SKILL_LESSONS");
    expect(skills.missions.map((m) => m.day)).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
    expect([...skills.appliesTo].sort()).toEqual([...ALL].sort());
    expect(() => programDefinition("NOPE" as ProgramKey)).toThrow();
  });

  it("lists programs per product", () => {
    expect(availablePrograms("VAPE").map((p) => p.key)).toEqual(["QUIT_VAPING", "DAILY_MISSIONS", "SKILL_LESSONS"]);
    expect(availablePrograms("CANNABIS").map((p) => p.key)).toEqual(["T_BREAK", "SKILL_LESSONS"]);
    expect(availablePrograms("GAMBLING").map((p) => p.key)).toEqual(["SKILL_LESSONS"]);
  });
});

describe("programStatus", () => {
  it("counts calendar days from the start, 1-based and capped", () => {
    expect(programStatus(enrollment("T_BREAK", at(1, 23)), at(1, 23)).day).toBe(1);
    expect(programStatus(enrollment("T_BREAK", at(1, 23)), at(2, 0)).day).toBe(2);
    expect(programStatus(enrollment("T_BREAK", at(1)), at(28)).day).toBe(28);
    expect(programStatus(enrollment("T_BREAK", at(1)), at(31) + 40 * 86_400_000).day).toBe(28);
    // A start in the future still shows day 1.
    expect(programStatus(enrollment("T_BREAK", at(5)), at(1)).day).toBe(1);
  });

  it("lists unlocked, uncompleted missions as due, oldest first", () => {
    const s = programStatus(enrollment("SKILL_LESSONS", at(1), ["sk-01", "unknown-key"]), at(5));
    expect(s.day).toBe(5);
    expect(s.completed).toBe(1);
    expect(s.total).toBe(8);
    expect(s.due.map((m) => m.key)).toEqual(["sk-02", "sk-03"]);
    expect(s.finished).toBe(false);
    expect(s.enrollmentId).toBe("p-SKILL_LESSONS");
  });

  it("finishes when every mission is completed, and freezes the day at endedAt", () => {
    const def = programDefinition("SKILL_LESSONS");
    const done = programStatus(enrollment("SKILL_LESSONS", at(1), def.missions.map((m) => m.key)), at(20));
    expect(done.finished).toBe(true);
    expect(done.due).toEqual([]);
    const ended = programStatus(enrollment("SKILL_LESSONS", at(1), [], at(3)), at(20));
    expect(ended.day).toBe(3);
  });

  it("works with enrollments produced by the reducer", () => {
    const doc = [
      startProgram({ id: "p1", program: "DRY_MONTH", startedAt: iso(at(1, 9)) }),
      completeMission({ programId: "p1", missionKey: "dry-01" }),
    ].reduce((d, a) => reducer(d, a), utils.createDocument());
    const [e] = doc.state.global.programs ?? [];
    const s = programStatus(e, at(3));
    expect(s.day).toBe(3);
    expect(s.due.map((m) => m.key)).toEqual(["dry-02", "dry-03"]);
  });
});
