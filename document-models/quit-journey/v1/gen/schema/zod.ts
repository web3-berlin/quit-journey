/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddExclusionInput,
  AddIfThenPlanInput,
  AddMotivationInput,
  AddNaloxoneKitInput,
  AddQuitAidInput,
  AddRewardGoalInput,
  AddRiskyPlaceInput,
  AddSupportContactInput,
  AidUse,
  Assessment,
  AssessmentInstrument,
  BeverageType,
  CheckIn,
  ClaimRewardInput,
  ClearMedicationPlanInput,
  CompleteMissionInput,
  CopingStrategy,
  Craving,
  CravingOutcome,
  CravingTrigger,
  DailyCheckInInput,
  DeleteAssessmentInput,
  DeleteCheckInInput,
  DeleteCravingInput,
  DeleteDrinkInput,
  DeleteDrugCheckInput,
  DeleteExclusionInput,
  DeleteGamblingLossInput,
  DeleteIfThenPlanInput,
  DeleteRewardGoalInput,
  DeleteRiskyPlaceInput,
  DeleteSlipInput,
  DoseStep,
  DoseStepInput,
  DrinkEntry,
  DrugCheck,
  DrugTestResult,
  DrugTestType,
  EndProgramInput,
  EndQuitAidInput,
  EndSafetyCheckInput,
  Exclusion,
  ExclusionScheme,
  GamblingLoss,
  HarmReductionAction,
  IfThenPlan,
  LogAidUseInput,
  LogCravingInput,
  LogDrinkInput,
  LogDrugCheckInput,
  LogGamblingLossInput,
  LogScreenTimeInput,
  LogSlipInput,
  MarkNaloxoneUsedInput,
  MedicationPlan,
  MedicationPlanSource,
  Motivation,
  NaloxoneKind,
  NaloxoneKit,
  ProductType,
  ProgramEnrollment,
  ProgramKey,
  QuitAid,
  QuitAidType,
  QuitAttempt,
  QuitJourneyLocalState,
  QuitJourneyState,
  QuitPlan,
  RecordAssessmentInput,
  RecordTakeHomeInput,
  RecoveryGoal,
  RemoveMotivationInput,
  RemoveNaloxoneKitInput,
  RemoveSupportContactInput,
  RestartJourneyInput,
  ReviewIfThenPlanInput,
  RewardGoal,
  RiskyPlace,
  SafetyCheck,
  SafetyCheckOutcome,
  ScreenTimeEntry,
  SetDisplayNameInput,
  SetMedicationPlanInput,
  SetQuitPlanInput,
  SetQuitlineInput,
  Slip,
  StartProgramInput,
  StartSafetyCheckInput,
  SupportContact,
  TakeHome,
  TogglePrepTaskInput,
  UpdateIfThenPlanInput,
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

export const AssessmentInstrumentSchema = z.enum([
  "ACSA",
  "AUDIT",
  "AUDIT_C",
  "BARC_10",
  "CUDIT_R",
  "CWS",
  "HSI",
  "PGSI",
  "SAWS",
  "SOWS",
]);

export const BeverageTypeSchema = z.enum([
  "BEER",
  "CIDER",
  "COCKTAIL",
  "OTHER",
  "SPIRITS",
  "WINE",
]);

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

export const DrugTestResultSchema = z.enum([
  "INCONCLUSIVE",
  "NEGATIVE",
  "POSITIVE",
]);

export const DrugTestTypeSchema = z.enum([
  "BENZO_STRIP",
  "CHECKING_SERVICE",
  "FENTANYL_STRIP",
  "MEDETOMIDINE_STRIP",
  "NITAZENE_STRIP",
  "OTHER",
  "REAGENT_KIT",
  "XYLAZINE_STRIP",
]);

export const ExclusionSchemeSchema = z.enum([
  "BANK_BLOCK",
  "BETBLOCKER",
  "GAMBAN",
  "GAMSTOP",
  "OASIS",
  "OTHER",
  "VENUE",
]);

export const HarmReductionActionSchema = z.enum([
  "DID_NOT_USE",
  "DISCARDED",
  "NALOXONE_READY",
  "NOT_ALONE",
  "TOLD_SOMEONE",
  "USED_LESS",
  "WENT_SLOWER",
]);

export const MedicationPlanSourceSchema = z.enum([
  "CLINICIAN",
  "LEAFLET",
  "SELF",
]);

export const NaloxoneKindSchema = z.enum([
  "AUTO_INJECTOR",
  "INJECTABLE",
  "NASAL_SPRAY_4MG",
  "NASAL_SPRAY_8MG",
  "OTHER",
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

export const ProgramKeySchema = z.enum([
  "DAILY_MISSIONS",
  "DRY_MONTH",
  "QUIT_VAPING",
  "SKILL_LESSONS",
  "T_BREAK",
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

export const SafetyCheckOutcomeSchema = z.enum([
  "ACTIVE",
  "ALARM",
  "CANCELLED",
  "OK",
]);

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

export function AddExclusionInputSchema(): z.ZodObject<
  Properties<AddExclusionInput>
> {
  return z.object({
    endDate: z.string().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    scheme: ExclusionSchemeSchema,
    startDate: z.string(),
  });
}

export function AddIfThenPlanInputSchema(): z.ZodObject<
  Properties<AddIfThenPlanInput>
> {
  return z.object({
    createdAt: z.iso.datetime(),
    id: z.string(),
    ifText: z.string(),
    strategy: CopingStrategySchema.nullish(),
    thenText: z.string(),
    trigger: CravingTriggerSchema.nullish(),
  });
}

export function AddMotivationInputSchema(): z.ZodObject<
  Properties<AddMotivationInput>
> {
  return z.object({
    id: z.string(),
    imageUrl: z.url().nullish(),
    text: z.string(),
  });
}

export function AddNaloxoneKitInputSchema(): z.ZodObject<
  Properties<AddNaloxoneKitInput>
> {
  return z.object({
    addedAt: z.iso.datetime(),
    expiresOn: z.string().nullish(),
    id: z.string(),
    kind: NaloxoneKindSchema,
    location: z.string().nullish(),
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

export function AddRiskyPlaceInputSchema(): z.ZodObject<
  Properties<AddRiskyPlaceInput>
> {
  return z.object({
    id: z.string(),
    label: z.string(),
    lat: z.number(),
    lng: z.number(),
    planId: z.string().nullish(),
    radiusM: z.number(),
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
    beforeDrinking: z.boolean().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    timestamp: z.iso.datetime(),
  });
}

export function AssessmentSchema(): z.ZodObject<Properties<Assessment>> {
  return z.object({
    __typename: z.literal("Assessment").optional(),
    answers: z.array(z.number()),
    id: z.string(),
    instrument: AssessmentInstrumentSchema,
    score: z.number(),
    takenAt: z.iso.datetime(),
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

export function ClearMedicationPlanInputSchema(): z.ZodObject<
  Properties<ClearMedicationPlanInput>
> {
  return z.object({
    aidId: z.string(),
  });
}

export function CompleteMissionInputSchema(): z.ZodObject<
  Properties<CompleteMissionInput>
> {
  return z.object({
    missionKey: z.string(),
    programId: z.string(),
  });
}

export function CravingSchema(): z.ZodObject<Properties<Craving>> {
  return z.object({
    __typename: z.literal("Craving").optional(),
    durationMinutes: z.number().nullish(),
    id: z.string(),
    intensity: z.number(),
    intensityAfter: z.number().nullish(),
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

export function DeleteAssessmentInputSchema(): z.ZodObject<
  Properties<DeleteAssessmentInput>
> {
  return z.object({
    id: z.string(),
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

export function DeleteDrinkInputSchema(): z.ZodObject<
  Properties<DeleteDrinkInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteDrugCheckInputSchema(): z.ZodObject<
  Properties<DeleteDrugCheckInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteExclusionInputSchema(): z.ZodObject<
  Properties<DeleteExclusionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteGamblingLossInputSchema(): z.ZodObject<
  Properties<DeleteGamblingLossInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteIfThenPlanInputSchema(): z.ZodObject<
  Properties<DeleteIfThenPlanInput>
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

export function DeleteRiskyPlaceInputSchema(): z.ZodObject<
  Properties<DeleteRiskyPlaceInput>
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

export function DoseStepSchema(): z.ZodObject<Properties<DoseStep>> {
  return z.object({
    __typename: z.literal("DoseStep").optional(),
    dose: z.string(),
    fromDay: z.number(),
    id: z.string(),
    timesPerDay: z.number(),
  });
}

export function DoseStepInputSchema(): z.ZodObject<Properties<DoseStepInput>> {
  return z.object({
    dose: z.string(),
    fromDay: z.number(),
    id: z.string(),
    timesPerDay: z.number(),
  });
}

export function DrinkEntrySchema(): z.ZodObject<Properties<DrinkEntry>> {
  return z.object({
    __typename: z.literal("DrinkEntry").optional(),
    abvPercent: z.number(),
    beverage: BeverageTypeSchema,
    gramsAlcohol: z.number(),
    id: z.string(),
    slipId: z.string(),
    standardDrinks: z.number(),
    timestamp: z.iso.datetime(),
    volumeMl: z.number(),
  });
}

export function DrugCheckSchema(): z.ZodObject<Properties<DrugCheck>> {
  return z.object({
    __typename: z.literal("DrugCheck").optional(),
    actions: z.array(HarmReductionActionSchema),
    checkedAt: z.iso.datetime(),
    expectedSubstance: z.string().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    result: DrugTestResultSchema,
    testType: DrugTestTypeSchema,
  });
}

export function EndProgramInputSchema(): z.ZodObject<
  Properties<EndProgramInput>
> {
  return z.object({
    endedAt: z.iso.datetime(),
    programId: z.string(),
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

export function EndSafetyCheckInputSchema(): z.ZodObject<
  Properties<EndSafetyCheckInput>
> {
  return z.object({
    endedAt: z.iso.datetime(),
    id: z.string(),
    outcome: SafetyCheckOutcomeSchema,
  });
}

export function ExclusionSchema(): z.ZodObject<Properties<Exclusion>> {
  return z.object({
    __typename: z.literal("Exclusion").optional(),
    endDate: z.string().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    scheme: ExclusionSchemeSchema,
    startDate: z.string(),
  });
}

export function GamblingLossSchema(): z.ZodObject<Properties<GamblingLoss>> {
  return z.object({
    __typename: z.literal("GamblingLoss").optional(),
    amount: z.number(),
    date: z.string(),
    id: z.string(),
    note: z.string().nullish(),
  });
}

export function IfThenPlanSchema(): z.ZodObject<Properties<IfThenPlan>> {
  return z.object({
    __typename: z.literal("IfThenPlan").optional(),
    createdAt: z.iso.datetime(),
    id: z.string(),
    ifText: z.string(),
    lastReviewedAt: z.iso.datetime().nullish(),
    strategy: CopingStrategySchema.nullish(),
    thenText: z.string(),
    trigger: CravingTriggerSchema.nullish(),
  });
}

export function LogAidUseInputSchema(): z.ZodObject<
  Properties<LogAidUseInput>
> {
  return z.object({
    aidId: z.string(),
    beforeDrinking: z.boolean().nullish(),
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
    intensityAfter: z.number().nullish(),
    note: z.string().nullish(),
    outcome: CravingOutcomeSchema,
    strategy: CopingStrategySchema.nullish(),
    timestamp: z.iso.datetime(),
    trigger: CravingTriggerSchema,
  });
}

export function LogDrinkInputSchema(): z.ZodObject<Properties<LogDrinkInput>> {
  return z.object({
    abvPercent: z.number(),
    beverage: BeverageTypeSchema,
    id: z.string(),
    note: z.string().nullish(),
    slipId: z.string(),
    timestamp: z.iso.datetime(),
    volumeMl: z.number(),
  });
}

export function LogDrugCheckInputSchema(): z.ZodObject<
  Properties<LogDrugCheckInput>
> {
  return z.object({
    actions: z.array(HarmReductionActionSchema).nullish(),
    checkedAt: z.iso.datetime(),
    expectedSubstance: z.string().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    result: DrugTestResultSchema,
    testType: DrugTestTypeSchema,
  });
}

export function LogGamblingLossInputSchema(): z.ZodObject<
  Properties<LogGamblingLossInput>
> {
  return z.object({
    amount: z.number(),
    date: z.string(),
    id: z.string(),
    note: z.string().nullish(),
  });
}

export function LogScreenTimeInputSchema(): z.ZodObject<
  Properties<LogScreenTimeInput>
> {
  return z.object({
    date: z.string(),
    id: z.string(),
    minutes: z.number(),
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

export function MarkNaloxoneUsedInputSchema(): z.ZodObject<
  Properties<MarkNaloxoneUsedInput>
> {
  return z.object({
    id: z.string(),
    usedAt: z.iso.datetime(),
  });
}

export function MedicationPlanSchema(): z.ZodObject<
  Properties<MedicationPlan>
> {
  return z.object({
    __typename: z.literal("MedicationPlan").optional(),
    aidId: z.string(),
    id: z.string(),
    note: z.string().nullish(),
    source: MedicationPlanSourceSchema,
    startDate: z.string(),
    steps: z.array(z.lazy(() => DoseStepSchema())),
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

export function NaloxoneKitSchema(): z.ZodObject<Properties<NaloxoneKit>> {
  return z.object({
    __typename: z.literal("NaloxoneKit").optional(),
    addedAt: z.iso.datetime(),
    expiresOn: z.string().nullish(),
    id: z.string(),
    kind: NaloxoneKindSchema,
    location: z.string().nullish(),
    usedAt: z.iso.datetime().nullish(),
  });
}

export function ProgramEnrollmentSchema(): z.ZodObject<
  Properties<ProgramEnrollment>
> {
  return z.object({
    __typename: z.literal("ProgramEnrollment").optional(),
    completedMissions: z.array(z.string()),
    endedAt: z.iso.datetime().nullish(),
    id: z.string(),
    program: ProgramKeySchema,
    startedAt: z.iso.datetime(),
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

export function QuitJourneyLocalStateSchema(): z.ZodObject<
  Properties<QuitJourneyLocalState>
> {
  return z.object({
    __typename: z.literal("QuitJourneyLocalState").optional(),
    riskyPlaces: z.array(z.lazy(() => RiskyPlaceSchema())).nullish(),
    safetyChecks: z.array(z.lazy(() => SafetyCheckSchema())).nullish(),
  });
}

export function QuitJourneyStateSchema(): z.ZodObject<
  Properties<QuitJourneyState>
> {
  return z.object({
    __typename: z.literal("QuitJourneyState").optional(),
    aidUses: z.array(z.lazy(() => AidUseSchema())),
    aids: z.array(z.lazy(() => QuitAidSchema())),
    assessments: z.array(z.lazy(() => AssessmentSchema())).nullish(),
    checkIns: z.array(z.lazy(() => CheckInSchema())),
    cravings: z.array(z.lazy(() => CravingSchema())),
    displayName: z.string().nullish(),
    drinks: z.array(z.lazy(() => DrinkEntrySchema())).nullish(),
    drugChecks: z.array(z.lazy(() => DrugCheckSchema())).nullish(),
    exclusions: z.array(z.lazy(() => ExclusionSchema())).nullish(),
    gamblingLosses: z.array(z.lazy(() => GamblingLossSchema())).nullish(),
    ifThenPlans: z.array(z.lazy(() => IfThenPlanSchema())).nullish(),
    medicationPlans: z.array(z.lazy(() => MedicationPlanSchema())).nullish(),
    motivations: z.array(z.lazy(() => MotivationSchema())),
    naloxoneKits: z.array(z.lazy(() => NaloxoneKitSchema())).nullish(),
    pastAttempts: z.array(z.lazy(() => QuitAttemptSchema())),
    plan: z.lazy(() => QuitPlanSchema().nullish()),
    prepTasksDone: z.array(z.string()),
    programs: z.array(z.lazy(() => ProgramEnrollmentSchema())).nullish(),
    quitlinePhone: z.string().nullish(),
    rewards: z.array(z.lazy(() => RewardGoalSchema())),
    screenTime: z.array(z.lazy(() => ScreenTimeEntrySchema())).nullish(),
    slips: z.array(z.lazy(() => SlipSchema())),
    supportContacts: z.array(z.lazy(() => SupportContactSchema())),
    takeHomes: z.array(z.lazy(() => TakeHomeSchema())).nullish(),
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
    standardDrinkGrams: z.number().nullish(),
    unitLabel: z.string().nullish(),
    unitsPerDay: z.number(),
    unitsPerPack: z.number(),
    yearsSmoked: z.number().nullish(),
  });
}

export function RecordAssessmentInputSchema(): z.ZodObject<
  Properties<RecordAssessmentInput>
> {
  return z.object({
    answers: z.array(z.number()),
    id: z.string(),
    instrument: AssessmentInstrumentSchema,
    takenAt: z.iso.datetime(),
  });
}

export function RecordTakeHomeInputSchema(): z.ZodObject<
  Properties<RecordTakeHomeInput>
> {
  return z.object({
    aidId: z.string(),
    doses: z.number(),
    id: z.string(),
    pickedUpOn: z.string(),
  });
}

export function RemoveMotivationInputSchema(): z.ZodObject<
  Properties<RemoveMotivationInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveNaloxoneKitInputSchema(): z.ZodObject<
  Properties<RemoveNaloxoneKitInput>
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

export function ReviewIfThenPlanInputSchema(): z.ZodObject<
  Properties<ReviewIfThenPlanInput>
> {
  return z.object({
    id: z.string(),
    reviewedAt: z.iso.datetime(),
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

export function RiskyPlaceSchema(): z.ZodObject<Properties<RiskyPlace>> {
  return z.object({
    __typename: z.literal("RiskyPlace").optional(),
    id: z.string(),
    label: z.string(),
    lat: z.number(),
    lng: z.number(),
    planId: z.string().nullish(),
    radiusM: z.number(),
  });
}

export function SafetyCheckSchema(): z.ZodObject<Properties<SafetyCheck>> {
  return z.object({
    __typename: z.literal("SafetyCheck").optional(),
    contactIds: z.array(z.string()),
    durationMinutes: z.number(),
    endedAt: z.iso.datetime().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    outcome: SafetyCheckOutcomeSchema,
    startedAt: z.iso.datetime(),
  });
}

export function ScreenTimeEntrySchema(): z.ZodObject<
  Properties<ScreenTimeEntry>
> {
  return z.object({
    __typename: z.literal("ScreenTimeEntry").optional(),
    date: z.string(),
    id: z.string(),
    minutes: z.number(),
  });
}

export function SetDisplayNameInputSchema(): z.ZodObject<
  Properties<SetDisplayNameInput>
> {
  return z.object({
    displayName: z.string().nullish(),
  });
}

export function SetMedicationPlanInputSchema(): z.ZodObject<
  Properties<SetMedicationPlanInput>
> {
  return z.object({
    aidId: z.string(),
    id: z.string(),
    note: z.string().nullish(),
    source: MedicationPlanSourceSchema,
    startDate: z.string(),
    steps: z.array(z.lazy(() => DoseStepInputSchema())),
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
    standardDrinkGrams: z.number().nullish(),
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

export function StartProgramInputSchema(): z.ZodObject<
  Properties<StartProgramInput>
> {
  return z.object({
    id: z.string(),
    program: ProgramKeySchema,
    startedAt: z.iso.datetime(),
  });
}

export function StartSafetyCheckInputSchema(): z.ZodObject<
  Properties<StartSafetyCheckInput>
> {
  return z.object({
    contactIds: z.array(z.string()).nullish(),
    durationMinutes: z.number(),
    id: z.string(),
    note: z.string().nullish(),
    startedAt: z.iso.datetime(),
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

export function TakeHomeSchema(): z.ZodObject<Properties<TakeHome>> {
  return z.object({
    __typename: z.literal("TakeHome").optional(),
    aidId: z.string(),
    doses: z.number(),
    id: z.string(),
    pickedUpOn: z.string(),
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

export function UpdateIfThenPlanInputSchema(): z.ZodObject<
  Properties<UpdateIfThenPlanInput>
> {
  return z.object({
    id: z.string(),
    ifText: z.string(),
    strategy: CopingStrategySchema.nullish(),
    thenText: z.string(),
    trigger: CravingTriggerSchema.nullish(),
  });
}
