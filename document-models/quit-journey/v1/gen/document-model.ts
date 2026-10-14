import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "w3b/quit-journey",
  name: "Quit Journey",
  author: {
    name: "W3B",
    website: "https://www.powerhouse.inc",
  },
  extension: ".quit",
  description:
    "A complete stop-smoking program: quit plan, live health recovery, savings and rewards, craving log with personal coping insights, slips without shame, daily check-ins, quit aids and a support network.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "enum ProductType { CIGARETTES ROLL_YOUR_OWN CIGARS VAPE HEATED_TOBACCO OTHER }\nenum CravingTrigger { STRESS COFFEE ALCOHOL AFTER_MEAL BOREDOM SOCIAL WORK DRIVING WAKING_UP PHONE ARGUMENT CELEBRATION LONELINESS OTHER }\nenum CopingStrategy { BREATHING WALK WATER SNACK GUM CALL_SOMEONE DISTRACTION EXERCISE MEDITATION QUIT_AID WAIT_IT_OUT OTHER }\nenum CravingOutcome { RESISTED SMOKED }\nenum QuitAidType { PATCH GUM LOZENGE INHALER MOUTH_SPRAY NASAL_SPRAY VARENICLINE BUPROPION CYTISINE COUNSELING APP_PROGRAM OTHER }\nenum WithdrawalSymptom { IRRITABILITY ANXIETY RESTLESSNESS INSOMNIA HUNGER HEADACHE LOW_MOOD POOR_CONCENTRATION COUGH CONSTIPATION DIZZINESS }\n\ntype QuitPlan {\n    quitDateTime: DateTime!\n    productType: ProductType!\n    unitsPerDay: Float!\n    unitsPerPack: Int!\n    packPrice: Float!\n    currency: Currency!\n    yearsSmoked: Float\n}\n\ntype Motivation {\n    id: OID!\n    text: String!\n    imageUrl: URL\n}\n\ntype Craving {\n    id: OID!\n    timestamp: DateTime!\n    intensity: Int!\n    trigger: CravingTrigger!\n    strategy: CopingStrategy\n    outcome: CravingOutcome!\n    durationMinutes: Int\n    note: String\n}\n\ntype Slip {\n    id: OID!\n    timestamp: DateTime!\n    units: Float!\n    trigger: CravingTrigger\n    note: String\n}\n\ntype QuitAttempt {\n    id: OID!\n    quitDateTime: DateTime!\n    endedAt: DateTime!\n    reason: String\n}\n\ntype CheckIn {\n    id: OID!\n    date: String!\n    mood: Int!\n    cravingLevel: Int!\n    energy: Int\n    sleepQuality: Int\n    weightKg: Float\n    symptoms: [WithdrawalSymptom!]!\n    note: String\n}\n\ntype RewardGoal {\n    id: OID!\n    title: String!\n    cost: Float!\n    emoji: String\n    claimedAt: DateTime\n}\n\ntype QuitAid {\n    id: OID!\n    type: QuitAidType!\n    name: String\n    dosage: String\n    startedAt: DateTime!\n    endedAt: DateTime\n}\n\ntype AidUse {\n    id: OID!\n    aidId: OID!\n    timestamp: DateTime!\n    note: String\n}\n\ntype SupportContact {\n    id: OID!\n    name: String!\n    phone: String\n    relation: String\n}\n\ntype QuitJourneyState {\n    displayName: String\n    plan: QuitPlan\n    motivations: [Motivation!]!\n    prepTasksDone: [String!]!\n    cravings: [Craving!]!\n    slips: [Slip!]!\n    pastAttempts: [QuitAttempt!]!\n    checkIns: [CheckIn!]!\n    rewards: [RewardGoal!]!\n    aids: [QuitAid!]!\n    aidUses: [AidUse!]!\n    supportContacts: [SupportContact!]!\n    quitlinePhone: String\n}",
          examples: [],
          initialValue:
            '{\n  "displayName": null,\n  "plan": null,\n  "motivations": [],\n  "prepTasksDone": [],\n  "cravings": [],\n  "slips": [],\n  "pastAttempts": [],\n  "checkIns": [],\n  "rewards": [],\n  "aids": [],\n  "aidUses": [],\n  "supportContacts": [],\n  "quitlinePhone": null\n}',
        },
      },
      modules: [
        {
          id: "mod-plan",
          name: "plan",
          description:
            "Quit plan, personal profile, motivations and pre-quit preparation",
          operations: [
            {
              id: "op-set-quit-plan",
              name: "SET_QUIT_PLAN",
              description:
                "Sets or updates the quit plan: quit date, product and consumption/cost baseline",
              schema:
                "input SetQuitPlanInput {\n    quitDateTime: DateTime!\n    productType: ProductType!\n    unitsPerDay: Float!\n    unitsPerPack: Int!\n    packPrice: Float!\n    currency: Currency!\n    yearsSmoked: Float\n}",
              template:
                "Sets or updates the quit plan: quit date, product and consumption/cost baseline",
              reducer:
                'const i = action.input;\nif (i.unitsPerDay <= 0 || i.unitsPerPack <= 0 || i.packPrice < 0) {\n  throw new InvalidQuitPlanError("unitsPerDay and unitsPerPack must be positive and packPrice must not be negative");\n}\nstate.plan = {\n  quitDateTime: i.quitDateTime,\n  productType: i.productType,\n  unitsPerDay: i.unitsPerDay,\n  unitsPerPack: i.unitsPerPack,\n  packPrice: i.packPrice,\n  currency: i.currency,\n  yearsSmoked: i.yearsSmoked ?? null,\n};',
              errors: [
                {
                  id: "err-invalid-quit-plan",
                  name: "InvalidQuitPlanError",
                  code: "INVALID_QUIT_PLAN",
                  description:
                    "Consumption values must be positive and price must not be negative",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-set-display-name",
              name: "SET_DISPLAY_NAME",
              description: "Sets the name shown in the editor greeting",
              schema: "input SetDisplayNameInput {\n    displayName: String\n}",
              template: "Sets the name shown in the editor greeting",
              reducer: "state.displayName = action.input.displayName || null;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-add-motivation",
              name: "ADD_MOTIVATION",
              description: "Adds a personal reason for quitting (my why)",
              schema:
                "input AddMotivationInput {\n    id: OID!\n    text: String!\n    imageUrl: URL\n}",
              template: "Adds a personal reason for quitting (my why)",
              reducer:
                'const text = action.input.text.trim();\nif (!text) {\n  throw new EmptyMotivationError("Motivation text must not be empty");\n}\nstate.motivations.push({ id: action.input.id, text, imageUrl: action.input.imageUrl || null });',
              errors: [
                {
                  id: "err-empty-motivation",
                  name: "EmptyMotivationError",
                  code: "EMPTY_MOTIVATION",
                  description: "Motivation text is empty",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-remove-motivation",
              name: "REMOVE_MOTIVATION",
              description: "Removes a motivation",
              schema: "input RemoveMotivationInput {\n    id: OID!\n}",
              template: "Removes a motivation",
              reducer:
                "const index = state.motivations.findIndex((m) => m.id === action.input.id);\nif (index === -1) {\n  throw new MotivationNotFoundError(`Motivation ${action.input.id} not found`);\n}\nstate.motivations.splice(index, 1);",
              errors: [
                {
                  id: "err-motivation-not-found",
                  name: "MotivationNotFoundError",
                  code: "MOTIVATION_NOT_FOUND",
                  description: "No motivation with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-toggle-prep-task",
              name: "TOGGLE_PREP_TASK",
              description:
                "Marks a pre-quit preparation checklist task as done or not done",
              schema:
                "input TogglePrepTaskInput {\n    taskKey: String!\n    done: Boolean!\n}",
              template:
                "Marks a pre-quit preparation checklist task as done or not done",
              reducer:
                "const key = action.input.taskKey;\nconst has = state.prepTasksDone.includes(key);\nif (action.input.done && !has) {\n  state.prepTasksDone.push(key);\n} else if (!action.input.done && has) {\n  state.prepTasksDone = state.prepTasksDone.filter((k) => k !== key);\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-cravings",
          name: "cravings",
          description:
            "Craving log with triggers, coping strategies and outcomes",
          operations: [
            {
              id: "op-log-craving",
              name: "LOG_CRAVING",
              description:
                "Logs a craving with its intensity, trigger, coping strategy used and whether it was resisted",
              schema:
                "input LogCravingInput {\n    id: OID!\n    timestamp: DateTime!\n    intensity: Int!\n    trigger: CravingTrigger!\n    strategy: CopingStrategy\n    outcome: CravingOutcome!\n    durationMinutes: Int\n    note: String\n}",
              template:
                "Logs a craving with its intensity, trigger, coping strategy used and whether it was resisted",
              reducer:
                'const i = action.input;\nif (!Number.isInteger(i.intensity) || i.intensity < 1 || i.intensity > 5) {\n  throw new InvalidCravingIntensityError("Intensity must be an integer between 1 and 5");\n}\nif (i.durationMinutes != null && i.durationMinutes < 0) {\n  throw new InvalidCravingDurationError("Duration must not be negative");\n}\nstate.cravings.push({\n  id: i.id,\n  timestamp: i.timestamp,\n  intensity: i.intensity,\n  trigger: i.trigger,\n  strategy: i.strategy ?? null,\n  outcome: i.outcome,\n  durationMinutes: i.durationMinutes ?? null,\n  note: i.note || null,\n});',
              errors: [
                {
                  id: "err-invalid-craving-intensity",
                  name: "InvalidCravingIntensityError",
                  code: "INVALID_CRAVING_INTENSITY",
                  description: "Intensity outside 1-5",
                  template: "",
                },
                {
                  id: "err-invalid-craving-duration",
                  name: "InvalidCravingDurationError",
                  code: "INVALID_CRAVING_DURATION",
                  description: "Negative craving duration",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-delete-craving",
              name: "DELETE_CRAVING",
              description: "Deletes a logged craving",
              schema: "input DeleteCravingInput {\n    id: OID!\n}",
              template: "Deletes a logged craving",
              reducer:
                "const index = state.cravings.findIndex((c) => c.id === action.input.id);\nif (index === -1) {\n  throw new CravingNotFoundError(`Craving ${action.input.id} not found`);\n}\nstate.cravings.splice(index, 1);",
              errors: [
                {
                  id: "err-craving-not-found",
                  name: "CravingNotFoundError",
                  code: "CRAVING_NOT_FOUND",
                  description: "No craving with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-slips",
          name: "slips",
          description:
            "Slips (lapses that do not reset progress) and full journey restarts",
          operations: [
            {
              id: "op-log-slip",
              name: "LOG_SLIP",
              description:
                "Logs a lapse; the quit date is kept and smoked units are subtracted from savings",
              schema:
                "input LogSlipInput {\n    id: OID!\n    timestamp: DateTime!\n    units: Float!\n    trigger: CravingTrigger\n    note: String\n}",
              template:
                "Logs a lapse; the quit date is kept and smoked units are subtracted from savings",
              reducer:
                'const i = action.input;\nif (i.units <= 0) {\n  throw new InvalidSlipUnitsError("Units smoked must be positive");\n}\nstate.slips.push({\n  id: i.id,\n  timestamp: i.timestamp,\n  units: i.units,\n  trigger: i.trigger ?? null,\n  note: i.note || null,\n});',
              errors: [
                {
                  id: "err-invalid-slip-units",
                  name: "InvalidSlipUnitsError",
                  code: "INVALID_SLIP_UNITS",
                  description: "Slip units must be positive",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-delete-slip",
              name: "DELETE_SLIP",
              description: "Deletes a logged slip",
              schema: "input DeleteSlipInput {\n    id: OID!\n}",
              template: "Deletes a logged slip",
              reducer:
                "const index = state.slips.findIndex((s) => s.id === action.input.id);\nif (index === -1) {\n  throw new SlipNotFoundError(`Slip ${action.input.id} not found`);\n}\nstate.slips.splice(index, 1);",
              errors: [
                {
                  id: "err-slip-not-found",
                  name: "SlipNotFoundError",
                  code: "SLIP_NOT_FOUND",
                  description: "No slip with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-restart-journey",
              name: "RESTART_JOURNEY",
              description:
                "Archives the current attempt into history and starts again from a new quit date",
              schema:
                "input RestartJourneyInput {\n    attemptId: OID!\n    endedAt: DateTime!\n    newQuitDateTime: DateTime!\n    reason: String\n}",
              template:
                "Archives the current attempt into history and starts again from a new quit date",
              reducer:
                'const i = action.input;\nif (!state.plan) {\n  throw new NoActiveQuitPlanError("There is no quit plan to restart");\n}\nconst previousQuit = Date.parse(state.plan.quitDateTime);\nif (Date.parse(i.endedAt) < previousQuit || Date.parse(i.newQuitDateTime) < Date.parse(i.endedAt)) {\n  throw new InvalidRestartDatesError("endedAt must be after the current quit date and the new quit date must not be before endedAt");\n}\nstate.pastAttempts.push({\n  id: i.attemptId,\n  quitDateTime: state.plan.quitDateTime,\n  endedAt: i.endedAt,\n  reason: i.reason || null,\n});\nstate.plan.quitDateTime = i.newQuitDateTime;',
              errors: [
                {
                  id: "err-no-active-quit-plan",
                  name: "NoActiveQuitPlanError",
                  code: "NO_ACTIVE_QUIT_PLAN",
                  description: "Restart requested without a quit plan",
                  template: "",
                },
                {
                  id: "err-invalid-restart-dates",
                  name: "InvalidRestartDatesError",
                  code: "INVALID_RESTART_DATES",
                  description: "Restart dates are out of order",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-checkins",
          name: "checkins",
          description:
            "Daily check-ins: mood, cravings, energy, sleep, weight and withdrawal symptoms",
          operations: [
            {
              id: "op-daily-check-in",
              name: "DAILY_CHECK_IN",
              description: "Records the daily check-in (one per calendar date)",
              schema:
                "input DailyCheckInInput {\n    id: OID!\n    date: String!\n    mood: Int!\n    cravingLevel: Int!\n    energy: Int\n    sleepQuality: Int\n    weightKg: Float\n    symptoms: [WithdrawalSymptom!]\n    note: String\n}",
              template: "Records the daily check-in (one per calendar date)",
              reducer:
                'const i = action.input;\nif (!/^\\d{4}-\\d{2}-\\d{2}$/.test(i.date)) {\n  throw new InvalidCheckinDateError("Check-in date must be a calendar date in YYYY-MM-DD format");\n}\nif (state.checkIns.some((c) => c.date === i.date)) {\n  throw new DuplicateCheckinDateError(`A check-in for ${i.date} already exists`);\n}\nconst ratings = [i.mood, i.cravingLevel, i.energy, i.sleepQuality].filter((r) => r != null);\nif (ratings.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {\n  throw new InvalidCheckinRatingError("Ratings must be integers between 1 and 5");\n}\nif (i.weightKg != null && i.weightKg <= 0) {\n  throw new InvalidWeightError("Weight must be positive");\n}\nstate.checkIns.push({\n  id: i.id,\n  date: i.date,\n  mood: i.mood,\n  cravingLevel: i.cravingLevel,\n  energy: i.energy ?? null,\n  sleepQuality: i.sleepQuality ?? null,\n  weightKg: i.weightKg ?? null,\n  symptoms: i.symptoms ?? [],\n  note: i.note || null,\n});',
              errors: [
                {
                  id: "err-duplicate-checkin-date",
                  name: "DuplicateCheckinDateError",
                  code: "DUPLICATE_CHECKIN_DATE",
                  description: "A check-in already exists for that date",
                  template: "",
                },
                {
                  id: "err-invalid-checkin-rating",
                  name: "InvalidCheckinRatingError",
                  code: "INVALID_CHECKIN_RATING",
                  description: "A rating is outside 1-5",
                  template: "",
                },
                {
                  id: "err-invalid-weight",
                  name: "InvalidWeightError",
                  code: "INVALID_WEIGHT",
                  description: "Weight must be positive",
                  template: "",
                },
                {
                  id: "err-invalid-checkin-date",
                  name: "InvalidCheckinDateError",
                  code: "INVALID_CHECKIN_DATE",
                  description: "Date is not in YYYY-MM-DD format",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-delete-check-in",
              name: "DELETE_CHECK_IN",
              description: "Deletes a check-in",
              schema: "input DeleteCheckInInput {\n    id: OID!\n}",
              template: "Deletes a check-in",
              reducer:
                "const index = state.checkIns.findIndex((c) => c.id === action.input.id);\nif (index === -1) {\n  throw new CheckinNotFoundError(`Check-in ${action.input.id} not found`);\n}\nstate.checkIns.splice(index, 1);",
              errors: [
                {
                  id: "err-checkin-not-found",
                  name: "CheckinNotFoundError",
                  code: "CHECKIN_NOT_FOUND",
                  description: "No check-in with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-rewards",
          name: "rewards",
          description:
            "Reward goals bought with the money saved by not smoking",
          operations: [
            {
              id: "op-add-reward-goal",
              name: "ADD_REWARD_GOAL",
              description: "Adds a treat to save up for",
              schema:
                "input AddRewardGoalInput {\n    id: OID!\n    title: String!\n    cost: Float!\n    emoji: String\n}",
              template: "Adds a treat to save up for",
              reducer:
                'const title = action.input.title.trim();\nif (!title || action.input.cost <= 0) {\n  throw new InvalidRewardGoalError("Reward needs a title and a positive cost");\n}\nstate.rewards.push({ id: action.input.id, title, cost: action.input.cost, emoji: action.input.emoji || null, claimedAt: null });',
              errors: [
                {
                  id: "err-invalid-reward-goal",
                  name: "InvalidRewardGoalError",
                  code: "INVALID_REWARD_GOAL",
                  description: "Reward title empty or cost not positive",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-claim-reward",
              name: "CLAIM_REWARD",
              description:
                "Claims a reward; succeeds only if unspent savings at claimedAt cover the cost",
              schema:
                "input ClaimRewardInput {\n    id: OID!\n    claimedAt: DateTime!\n}",
              template:
                "Claims a reward; succeeds only if unspent savings at claimedAt cover the cost",
              reducer:
                'const reward = state.rewards.find((r) => r.id === action.input.id);\nif (!reward) {\n  throw new RewardNotFoundError(`Reward ${action.input.id} not found`);\n}\nif (reward.claimedAt) {\n  throw new RewardAlreadyClaimedError("Reward was already claimed");\n}\nconst plan = state.plan;\nif (!plan) {\n  throw new InsufficientSavingsError("Set a quit plan before claiming rewards");\n}\nconst at = Date.parse(action.input.claimedAt);\nconst periods = state.pastAttempts.map((a) => [Date.parse(a.quitDateTime), Date.parse(a.endedAt)]);\nperiods.push([Date.parse(plan.quitDateTime), at]);\nlet units = 0;\nfor (const [start, end] of periods) {\n  if (end <= start) continue;\n  const slipped = state.slips\n    .filter((s) => { const t = Date.parse(s.timestamp); return t >= start && t <= end; })\n    .reduce((sum, s) => sum + s.units, 0);\n  units += Math.max(0, ((end - start) / 86400000) * plan.unitsPerDay - slipped);\n}\nconst earned = units * (plan.packPrice / plan.unitsPerPack);\nconst spent = state.rewards.reduce((sum, r) => sum + (r.claimedAt ? r.cost : 0), 0);\nif (earned - spent < reward.cost) {\n  throw new InsufficientSavingsError(`Not enough savings yet: ${(earned - spent).toFixed(2)} available, ${reward.cost.toFixed(2)} needed`);\n}\nreward.claimedAt = action.input.claimedAt;',
              errors: [
                {
                  id: "err-reward-not-found",
                  name: "RewardNotFoundError",
                  code: "REWARD_NOT_FOUND",
                  description: "No reward with the given id",
                  template: "",
                },
                {
                  id: "err-reward-already-claimed",
                  name: "RewardAlreadyClaimedError",
                  code: "REWARD_ALREADY_CLAIMED",
                  description: "Reward already claimed",
                  template: "",
                },
                {
                  id: "err-insufficient-savings",
                  name: "InsufficientSavingsError",
                  code: "INSUFFICIENT_SAVINGS",
                  description: "Unspent savings do not cover the reward cost",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-delete-reward-goal",
              name: "DELETE_REWARD_GOAL",
              description: "Deletes a reward goal",
              schema: "input DeleteRewardGoalInput {\n    id: OID!\n}",
              template: "Deletes a reward goal",
              reducer:
                "const index = state.rewards.findIndex((r) => r.id === action.input.id);\nif (index === -1) {\n  throw new RewardGoalToDeleteNotFoundError(`Reward ${action.input.id} not found`);\n}\nstate.rewards.splice(index, 1);",
              errors: [
                {
                  id: "err-reward-goal-to-delete-not-found",
                  name: "RewardGoalToDeleteNotFoundError",
                  code: "REWARD_GOAL_TO_DELETE_NOT_FOUND",
                  description: "No reward with the given id to delete",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-aids",
          name: "aids",
          description:
            "Quit aids: nicotine replacement, medication and counseling",
          operations: [
            {
              id: "op-add-quit-aid",
              name: "ADD_QUIT_AID",
              description: "Starts using a quit aid",
              schema:
                "input AddQuitAidInput {\n    id: OID!\n    type: QuitAidType!\n    name: String\n    dosage: String\n    startedAt: DateTime!\n}",
              template: "Starts using a quit aid",
              reducer:
                "const i = action.input;\nstate.aids.push({ id: i.id, type: i.type, name: i.name || null, dosage: i.dosage || null, startedAt: i.startedAt, endedAt: null });",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-end-quit-aid",
              name: "END_QUIT_AID",
              description: "Stops using a quit aid",
              schema:
                "input EndQuitAidInput {\n    id: OID!\n    endedAt: DateTime!\n}",
              template: "Stops using a quit aid",
              reducer:
                "const aid = state.aids.find((a) => a.id === action.input.id);\nif (!aid) {\n  throw new QuitAidNotFoundError(`Quit aid ${action.input.id} not found`);\n}\naid.endedAt = action.input.endedAt;",
              errors: [
                {
                  id: "err-quit-aid-not-found",
                  name: "QuitAidNotFoundError",
                  code: "QUIT_AID_NOT_FOUND",
                  description: "No quit aid with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-log-aid-use",
              name: "LOG_AID_USE",
              description:
                "Logs a single use of a quit aid (e.g. a piece of gum or a new patch)",
              schema:
                "input LogAidUseInput {\n    id: OID!\n    aidId: OID!\n    timestamp: DateTime!\n    note: String\n}",
              template:
                "Logs a single use of a quit aid (e.g. a piece of gum or a new patch)",
              reducer:
                "const i = action.input;\nif (!state.aids.some((a) => a.id === i.aidId)) {\n  throw new AidForUseNotFoundError(`Quit aid ${i.aidId} not found`);\n}\nstate.aidUses.push({ id: i.id, aidId: i.aidId, timestamp: i.timestamp, note: i.note || null });",
              errors: [
                {
                  id: "err-aid-for-use-not-found",
                  name: "AidForUseNotFoundError",
                  code: "AID_FOR_USE_NOT_FOUND",
                  description: "The referenced quit aid does not exist",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "mod-support",
          name: "support",
          description: "Support network shown in the craving SOS screen",
          operations: [
            {
              id: "op-add-support-contact",
              name: "ADD_SUPPORT_CONTACT",
              description: "Adds a person to call when a craving hits",
              schema:
                "input AddSupportContactInput {\n    id: OID!\n    name: String!\n    phone: String\n    relation: String\n}",
              template: "Adds a person to call when a craving hits",
              reducer:
                'const name = action.input.name.trim();\nif (!name) {\n  throw new EmptyContactNameError("Contact name must not be empty");\n}\nstate.supportContacts.push({ id: action.input.id, name, phone: action.input.phone || null, relation: action.input.relation || null });',
              errors: [
                {
                  id: "err-empty-contact-name",
                  name: "EmptyContactNameError",
                  code: "EMPTY_CONTACT_NAME",
                  description: "Contact name is empty",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-remove-support-contact",
              name: "REMOVE_SUPPORT_CONTACT",
              description: "Removes a support contact",
              schema: "input RemoveSupportContactInput {\n    id: OID!\n}",
              template: "Removes a support contact",
              reducer:
                "const index = state.supportContacts.findIndex((c) => c.id === action.input.id);\nif (index === -1) {\n  throw new SupportContactNotFoundError(`Contact ${action.input.id} not found`);\n}\nstate.supportContacts.splice(index, 1);",
              errors: [
                {
                  id: "err-support-contact-not-found",
                  name: "SupportContactNotFoundError",
                  code: "SUPPORT_CONTACT_NOT_FOUND",
                  description: "No contact with the given id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-set-quitline",
              name: "SET_QUITLINE",
              description: "Sets the phone number of the local quitline",
              schema: "input SetQuitlineInput {\n    phone: String\n}",
              template: "Sets the phone number of the local quitline",
              reducer: "state.quitlinePhone = action.input.phone || null;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
