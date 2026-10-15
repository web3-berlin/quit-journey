import type { QuitJourneyAssessmentsOperations } from "document-models/quit-journey/v1";
import {
  AssessmentNotFoundError,
  InvalidAssessmentAnswersError,
} from "../../gen/assessments/error.js";

export const quitJourneyAssessmentsOperations: QuitJourneyAssessmentsOperations =
  {
    recordAssessmentOperation(state, action) {
      const i = action.input;
      // [number of items, lowest answer, highest answer] per instrument.
      const shape: Record<string, [number, number, number]> = {
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
      const [count, min, max] = shape[i.instrument];
      if (
        i.answers.length !== count ||
        i.answers.some((a) => !Number.isInteger(a) || a < min || a > max)
      ) {
        throw new InvalidAssessmentAnswersError(
          `${i.instrument} needs ${count} answers between ${min} and ${max}`,
        );
      }
      (state.assessments ??= []).push({
        id: i.id,
        instrument: i.instrument,
        takenAt: i.takenAt,
        answers: i.answers,
        score: i.answers.reduce((sum, a) => sum + a, 0),
      });
    },
    deleteAssessmentOperation(state, action) {
      const index = (state.assessments ?? []).findIndex(
        (x) => x.id === action.input.id,
      );
      if (index === -1) {
        throw new AssessmentNotFoundError(
          `Assessment ${action.input.id} not found`,
        );
      }
      state.assessments?.splice(index, 1);
    },
  };
