import type { QuitJourneyRewardsOperations } from "document-models/quit-journey/v1";
import {
  InsufficientSavingsError,
  InvalidRewardGoalError,
  RewardAlreadyClaimedError,
  RewardGoalToDeleteNotFoundError,
  RewardNotFoundError,
} from "../../gen/rewards/error.js";

export const quitJourneyRewardsOperations: QuitJourneyRewardsOperations = {
  addRewardGoalOperation(state, action) {
    const title = action.input.title.trim();
    if (!title || action.input.cost <= 0) {
      throw new InvalidRewardGoalError(
        "Reward needs a title and a positive cost",
      );
    }
    state.rewards.push({
      id: action.input.id,
      title,
      cost: action.input.cost,
      emoji: action.input.emoji || null,
      claimedAt: null,
    });
  },
  claimRewardOperation(state, action) {
    const reward = state.rewards.find((r) => r.id === action.input.id);
    if (!reward) {
      throw new RewardNotFoundError(`Reward ${action.input.id} not found`);
    }
    if (reward.claimedAt) {
      throw new RewardAlreadyClaimedError("Reward was already claimed");
    }
    const plan = state.plan;
    if (!plan) {
      throw new InsufficientSavingsError(
        "Set a quit plan before claiming rewards",
      );
    }
    const at = Date.parse(action.input.claimedAt);
    const periods = state.pastAttempts.map((a) => [
      Date.parse(a.quitDateTime),
      Date.parse(a.endedAt),
    ]);
    periods.push([Date.parse(plan.quitDateTime), at]);
    let units = 0;
    for (const [start, end] of periods) {
      if (end <= start) continue;
      const slipped = state.slips
        .filter((s) => {
          const t = Date.parse(s.timestamp);
          return t >= start && t <= end;
        })
        .reduce((sum, s) => sum + s.units, 0);
      units += Math.max(
        0,
        ((end - start) / 86400000) * plan.unitsPerDay - slipped,
      );
    }
    const earned = units * (plan.packPrice / plan.unitsPerPack);
    const spent = state.rewards.reduce(
      (sum, r) => sum + (r.claimedAt ? r.cost : 0),
      0,
    );
    if (earned - spent < reward.cost) {
      throw new InsufficientSavingsError(
        `Not enough savings yet: ${(earned - spent).toFixed(2)} available, ${reward.cost.toFixed(2)} needed`,
      );
    }
    reward.claimedAt = action.input.claimedAt;
  },
  deleteRewardGoalOperation(state, action) {
    const index = state.rewards.findIndex((r) => r.id === action.input.id);
    if (index === -1) {
      throw new RewardGoalToDeleteNotFoundError(
        `Reward ${action.input.id} not found`,
      );
    }
    state.rewards.splice(index, 1);
  },
};
