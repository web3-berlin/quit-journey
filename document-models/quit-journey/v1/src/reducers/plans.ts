import type { QuitJourneyPlansOperations } from "document-models/quit-journey/v1";
import {
  IfThenPlanNotFoundError,
  IfThenPlanToDeleteNotFoundError,
  IfThenPlanToReviewNotFoundError,
  InvalidIfThenPlanError,
  InvalidIfThenPlanUpdateError,
} from "../../gen/plans/error.js";

export const quitJourneyPlansOperations: QuitJourneyPlansOperations = {
  addIfThenPlanOperation(state, action) {
    const i = action.input;
    const ifText = i.ifText.trim();
    const thenText = i.thenText.trim();
    if (!ifText || !thenText) {
      throw new InvalidIfThenPlanError(
        "Both the 'if' and the 'then' part are needed",
      );
    }
    (state.ifThenPlans ??= []).push({
      id: i.id,
      trigger: i.trigger ?? null,
      ifText,
      thenText,
      strategy: i.strategy ?? null,
      createdAt: i.createdAt,
      lastReviewedAt: null,
    });
  },
  updateIfThenPlanOperation(state, action) {
    const i = action.input;
    const plan = (state.ifThenPlans ?? []).find((p) => p.id === i.id);
    if (!plan) {
      throw new IfThenPlanNotFoundError(`Plan ${i.id} not found`);
    }
    const ifText = i.ifText.trim();
    const thenText = i.thenText.trim();
    if (!ifText || !thenText) {
      throw new InvalidIfThenPlanUpdateError(
        "Both the 'if' and the 'then' part are needed",
      );
    }
    plan.trigger = i.trigger ?? null;
    plan.ifText = ifText;
    plan.thenText = thenText;
    plan.strategy = i.strategy ?? null;
  },
  reviewIfThenPlanOperation(state, action) {
    const plan = (state.ifThenPlans ?? []).find(
      (p) => p.id === action.input.id,
    );
    if (!plan) {
      throw new IfThenPlanToReviewNotFoundError(
        `Plan ${action.input.id} not found`,
      );
    }
    plan.lastReviewedAt = action.input.reviewedAt;
  },
  deleteIfThenPlanOperation(state, action) {
    const index = (state.ifThenPlans ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new IfThenPlanToDeleteNotFoundError(
        `Plan ${action.input.id} not found`,
      );
    }
    state.ifThenPlans?.splice(index, 1);
  },
};
