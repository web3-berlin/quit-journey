/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddMotivationInput,
  AddQuitAidInput,
  AddRewardGoalInput,
  AddSupportContactInput,
  AidUse,
  CheckIn,
  ClaimRewardInput,
  CopingStrategy,
  Craving,
  CravingOutcome,
  CravingTrigger,
  DailyCheckInInput,
  DeleteCheckInInput,
  DeleteCravingInput,
  DeleteRewardGoalInput,
  DeleteSlipInput,
  EndQuitAidInput,
  LogAidUseInput,
  LogCravingInput,
  LogSlipInput,
  Motivation,
  ProductType,
  QuitAid,
  QuitAidType,
  QuitAttempt,
  QuitJourneyState,
  QuitPlan,
  RecoveryGoal,
  RemoveMotivationInput,
  RemoveSupportContactInput,
  RestartJourneyInput,
  RewardGoal,
  SetDisplayNameInput,
  SetQuitPlanInput,
  SetQuitlineInput,
  Slip,
  SupportContact,
  TogglePrepTaskInput,
  WithdrawalSymptom,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const CopingStrategySchema = z.enum([
  "BREATHING",
  "CALL_SOMEONE",
  "COLD_WATER",
  "DISTRACTION",
  "EXERCISE",
  "GUM",
  "MEDITATION",
  "OTHER",
  "PLAY_THE_TAPE",
  "PRAYER",
  "QUIT_AID",
  "SNACK",
  "SUPPORT_MEETING",
  "URGE_SURFING",
  "WAIT_IT_OUT",
  "WALK",
  "WATER",
]);

export const CravingOutcomeSchema = z.enum(["RESISTED", "SMOKED"]);

export const CravingTriggerSchema = z.enum([
  "AFTER_MEAL",
  "ALCOHOL",
  "ANGRY",
  "ARGUMENT",
  "BAD_NEWS",
  "BOREDOM",
  "CELEBRATION",
  "COFFEE",
  "DRIVING",
  "HUNGRY",
  "LONELINESS",
  "OTHER",
  "PAIN",
  "PAYDAY",
  "PEOPLE_PLACES",
  "PHONE",
  "SEEING_IT",
  "SOCIAL",
  "STRESS",
  "TIRED",
  "WAKING_UP",
  "WORK",
]);

export const ProductTypeSchema = z.enum([
  "ALCOHOL",
  "BENZODIAZEPINES",
  "CAFFEINE",
  "CANNABIS",
  "CIGARETTES",
  "CIGARS",
  "GAMBLING",
  "GAMING",
  "HEATED_TOBACCO",
  "KRATOM",
  "OPIOIDS",
  "OTHER",
  "PORNOGRAPHY",
  "ROLL_YOUR_OWN",
  "SOCIAL_MEDIA",
  "STIMULANTS",
  "SUGAR",
  "VAPE",
]);

export const QuitAidTypeSchema = z.enum([
  "ACAMPROSATE",
  "APP_PROGRAM",
  "BUPRENORPHINE",
  "BUPROPION",
  "COUNSELING",
  "CYTISINE",
  "DISULFIRAM",
  "GUM",
  "INHALER",
  "LOZENGE",
  "METHADONE",
  "MOUTH_SPRAY",
  "NALTREXONE",
  "NASAL_SPRAY",
  "OTHER",
  "PATCH",
  "SUPPORT_GROUP",
  "THERAPY",
  "VARENICLINE",
]);

export const RecoveryGoalSchema = z.enum(["ABSTINENCE", "REDUCTION"]);

export const WithdrawalSymptomSchema = z.enum([
  "ANHEDONIA",
  "ANXIETY",
  "CHILLS",
  "CONSTIPATION",
  "COUGH",
  "DIARRHEA",
  "DIZZINESS",
  "HEADACHE",
  "HUNGER",
  "INSOMNIA",
  "IRRITABILITY",
  "LOW_MOOD",
  "MUSCLE_ACHES",
  "NAUSEA",
  "POOR_CONCENTRATION",
  "RESTLESSNESS",
  "SWEATING",
  "TREMOR",
  "VIVID_DREAMS",
]);

export function AddMotivationInputSchema(): z.ZodObject<
  Properties<AddMotivationInput>
> {
  return z.object({
    id: z.string(),
    imageUrl: z.url().nullish(),
    text: z.string(),
  });
}

export function AddQuitAidInputSchema(): z.ZodObject<
  Properties<AddQuitAidInput>
> {
  return z.object({
    dosage: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    startedAt: z.iso.datetime(),
    type: QuitAidTypeSchema,
  });
}

export function AddRewardGoalInputSchema(): z.ZodObject<
  Properties<AddRewardGoalInput>
> {
  return z.object({
    cost: z.number(),
    emoji: z.string().nullish(),
    id: z.string(),
    title: z.string(),
  });
}

export function AddSupportContactInputSchema(): z.ZodObject<
  Properties<AddSupportContactInput>
> {
  return z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullish(),
    relation: z.string().nullish(),
  });
}

export function AidUseSchema(): z.ZodObject<Properties<AidUse>> {
  return z.object({
    __typename: z.literal("AidUse").optional(),
    aidId: z.string(),
    id: z.string(),
    note: z.string().nullish(),
    timestamp: z.iso.datetime(),
  });
}

export function CheckInSchema(): z.ZodObject<Properties<CheckIn>> {
  return z.object({
    __typename: z.literal("CheckIn").optional(),
    cravingLevel: z.number(),
    date: z.string(),
    energy: z.number().nullish(),
    id: z.string(),
    mood: z.number(),
    note: z.string().nullish(),
    sleepQuality: z.number().nullish(),
    symptoms: z.array(WithdrawalSymptomSchema),
    weightKg: z.number().nullish(),
  });
}

export function ClaimRewardInputSchema(): z.ZodObject<
  Properties<ClaimRewardInput>
> {
  return z.object({
    claimedAt: z.iso.datetime(),
    id: z.string(),
  });
}

export function CravingSchema(): z.ZodObject<Properties<Craving>> {
  return z.object({
    __typename: z.literal("Craving").optional(),
    durationMinutes: z.number().nullish(),
    id: z.string(),
    intensity: z.number(),
    note: z.string().nullish(),
    outcome: CravingOutcomeSchema,
    strategy: CopingStrategySchema.nullish(),
    timestamp: z.iso.datetime(),
    trigger: CravingTriggerSchema,
  });
}

export function DailyCheckInInputSchema(): z.ZodObject<
  Properties<DailyCheckInInput>
> {
  return z.object({
    cravingLevel: z.number(),
    date: z.string(),
    energy: z.number().nullish(),
    id: z.string(),
    mood: z.number(),
    note: z.string().nullish(),
    sleepQuality: z.number().nullish(),
    symptoms: z.array(WithdrawalSymptomSchema).nullish(),
    weightKg: z.number().nullish(),
  });
}

export function DeleteCheckInInputSchema(): z.ZodObject<
  Properties<DeleteCheckInInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteCravingInputSchema(): z.ZodObject<
  Properties<DeleteCravingInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteRewardGoalInputSchema(): z.ZodObject<
  Properties<DeleteRewardGoalInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteSlipInputSchema(): z.ZodObject<
  Properties<DeleteSlipInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function EndQuitAidInputSchema(): z.ZodObject<
  Properties<EndQuitAidInput>
> {
  return z.object({
    endedAt: z.iso.datetime(),
    id: z.string(),
  });
}

export function LogAidUseInputSchema(): z.ZodObject<
  Properties<LogAidUseInput>
> {
  return z.object({
    aidId: z.string(),
    id: z.string(),
    note: z.string().nullish(),
    timestamp: z.iso.datetime(),
  });
}

export function LogCravingInputSchema(): z.ZodObject<
  Properties<LogCravingInput>
> {
  return z.object({
    durationMinutes: z.number().nullish(),
    id: z.string(),
    intensity: z.number(),
    note: z.string().nullish(),
    outcome: CravingOutcomeSchema,
    strategy: CopingStrategySchema.nullish(),
    timestamp: z.iso.datetime(),
    trigger: CravingTriggerSchema,
  });
}

export function LogSlipInputSchema(): z.ZodObject<Properties<LogSlipInput>> {
  return z.object({
    id: z.string(),
    note: z.string().nullish(),
    timestamp: z.iso.datetime(),
    trigger: CravingTriggerSchema.nullish(),
    units: z.number(),
  });
}

export function MotivationSchema(): z.ZodObject<Properties<Motivation>> {
  return z.object({
    __typename: z.literal("Motivation").optional(),
    id: z.string(),
    imageUrl: z.url().nullish(),
    text: z.string(),
  });
}

export function QuitAidSchema(): z.ZodObject<Properties<QuitAid>> {
  return z.object({
    __typename: z.literal("QuitAid").optional(),
    dosage: z.string().nullish(),
    endedAt: z.iso.datetime().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    startedAt: z.iso.datetime(),
    type: QuitAidTypeSchema,
  });
}

export function QuitAttemptSchema(): z.ZodObject<Properties<QuitAttempt>> {
  return z.object({
    __typename: z.literal("QuitAttempt").optional(),
    endedAt: z.iso.datetime(),
    id: z.string(),
    quitDateTime: z.iso.datetime(),
    reason: z.string().nullish(),
  });
}

export function QuitJourneyStateSchema(): z.ZodObject<
  Properties<QuitJourneyState>
> {
  return z.object({
    __typename: z.literal("QuitJourneyState").optional(),
    aidUses: z.array(z.lazy(() => AidUseSchema())),
    aids: z.array(z.lazy(() => QuitAidSchema())),
    checkIns: z.array(z.lazy(() => CheckInSchema())),
    cravings: z.array(z.lazy(() => CravingSchema())),
    displayName: z.string().nullish(),
    motivations: z.array(z.lazy(() => MotivationSchema())),
    pastAttempts: z.array(z.lazy(() => QuitAttemptSchema())),
    plan: z.lazy(() => QuitPlanSchema().nullish()),
    prepTasksDone: z.array(z.string()),
    quitlinePhone: z.string().nullish(),
    rewards: z.array(z.lazy(() => RewardGoalSchema())),
    slips: z.array(z.lazy(() => SlipSchema())),
    supportContacts: z.array(z.lazy(() => SupportContactSchema())),
  });
}

export function QuitPlanSchema(): z.ZodObject<Properties<QuitPlan>> {
  return z.object({
    __typename: z.literal("QuitPlan").optional(),
    currency: z.string(),
    customName: z.string().nullish(),
    dailyLimit: z.number().nullish(),
    goal: RecoveryGoalSchema.nullish(),
    packPrice: z.number(),
    productType: ProductTypeSchema,
    quitDateTime: z.iso.datetime(),
    unitLabel: z.string().nullish(),
    unitsPerDay: z.number(),
    unitsPerPack: z.number(),
    yearsSmoked: z.number().nullish(),
  });
}

export function RemoveMotivationInputSchema(): z.ZodObject<
  Properties<RemoveMotivationInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveSupportContactInputSchema(): z.ZodObject<
  Properties<RemoveSupportContactInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RestartJourneyInputSchema(): z.ZodObject<
  Properties<RestartJourneyInput>
> {
  return z.object({
    attemptId: z.string(),
    endedAt: z.iso.datetime(),
    newQuitDateTime: z.iso.datetime(),
    reason: z.string().nullish(),
  });
}

export function RewardGoalSchema(): z.ZodObject<Properties<RewardGoal>> {
  return z.object({
    __typename: z.literal("RewardGoal").optional(),
    claimedAt: z.iso.datetime().nullish(),
    cost: z.number(),
    emoji: z.string().nullish(),
    id: z.string(),
    title: z.string(),
  });
}

export function SetDisplayNameInputSchema(): z.ZodObject<
  Properties<SetDisplayNameInput>
> {
  return z.object({
    displayName: z.string().nullish(),
  });
}

export function SetQuitPlanInputSchema(): z.ZodObject<
  Properties<SetQuitPlanInput>
> {
  return z.object({
    currency: z.string(),
    customName: z.string().nullish(),
    dailyLimit: z.number().nullish(),
    goal: RecoveryGoalSchema.nullish(),
    packPrice: z.number(),
    productType: ProductTypeSchema,
    quitDateTime: z.iso.datetime(),
    unitLabel: z.string().nullish(),
    unitsPerDay: z.number(),
    unitsPerPack: z.number(),
    yearsSmoked: z.number().nullish(),
  });
}

export function SetQuitlineInputSchema(): z.ZodObject<
  Properties<SetQuitlineInput>
> {
  return z.object({
    phone: z.string().nullish(),
  });
}

export function SlipSchema(): z.ZodObject<Properties<Slip>> {
  return z.object({
    __typename: z.literal("Slip").optional(),
    id: z.string(),
    note: z.string().nullish(),
    timestamp: z.iso.datetime(),
    trigger: CravingTriggerSchema.nullish(),
    units: z.number(),
  });
}

export function SupportContactSchema(): z.ZodObject<
  Properties<SupportContact>
> {
  return z.object({
    __typename: z.literal("SupportContact").optional(),
    id: z.string(),
    name: z.string(),
    phone: z.string().nullish(),
    relation: z.string().nullish(),
  });
}

export function TogglePrepTaskInputSchema(): z.ZodObject<
  Properties<TogglePrepTaskInput>
> {
  return z.object({
    done: z.boolean(),
    taskKey: z.string(),
  });
}
