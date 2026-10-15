export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  AttachmentRef: {
    input: `attachment://v${number}:${string}`;
    output: `attachment://v${number}:${string}`;
  };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AddExclusionInput = {
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  scheme: ExclusionScheme;
  startDate: Scalars["String"]["input"];
};

export type AddIfThenPlanInput = {
  createdAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  ifText: Scalars["String"]["input"];
  strategy?: InputMaybe<CopingStrategy>;
  thenText: Scalars["String"]["input"];
  trigger?: InputMaybe<CravingTrigger>;
};

export type AddMotivationInput = {
  id: Scalars["OID"]["input"];
  imageUrl?: InputMaybe<Scalars["URL"]["input"]>;
  text: Scalars["String"]["input"];
};

export type AddNaloxoneKitInput = {
  addedAt: Scalars["DateTime"]["input"];
  expiresOn?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: NaloxoneKind;
  location?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddQuitAidInput = {
  dosage?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  startedAt: Scalars["DateTime"]["input"];
  type: QuitAidType;
};

export type AddRewardGoalInput = {
  cost: Scalars["Float"]["input"];
  emoji?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type AddRiskyPlaceInput = {
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  lat: Scalars["Float"]["input"];
  lng: Scalars["Float"]["input"];
  planId?: InputMaybe<Scalars["OID"]["input"]>;
  radiusM: Scalars["Int"]["input"];
};

export type AddSupportContactInput = {
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  relation?: InputMaybe<Scalars["String"]["input"]>;
};

export type AidUse = {
  aidId: Scalars["OID"]["output"];
  beforeDrinking: Maybe<Scalars["Boolean"]["output"]>;
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["DateTime"]["output"];
};

export type Assessment = {
  answers: Array<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  instrument: AssessmentInstrument;
  score: Scalars["Int"]["output"];
  takenAt: Scalars["DateTime"]["output"];
};

export type AssessmentInstrument =
  | "ACSA"
  | "AUDIT"
  | "AUDIT_C"
  | "BARC_10"
  | "CUDIT_R"
  | "CWS"
  | "HSI"
  | "PGSI"
  | "SAWS"
  | "SOWS";

export type BeverageType =
  | "BEER"
  | "CIDER"
  | "COCKTAIL"
  | "OTHER"
  | "SPIRITS"
  | "WINE";

export type CheckIn = {
  cravingLevel: Scalars["Int"]["output"];
  date: Scalars["String"]["output"];
  energy: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  mood: Scalars["Int"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  sleepQuality: Maybe<Scalars["Int"]["output"]>;
  symptoms: Array<WithdrawalSymptom>;
  weightKg: Maybe<Scalars["Float"]["output"]>;
};

export type ClaimRewardInput = {
  claimedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
};

export type ClearMedicationPlanInput = {
  aidId: Scalars["OID"]["input"];
};

export type CompleteMissionInput = {
  missionKey: Scalars["String"]["input"];
  programId: Scalars["OID"]["input"];
};

export type CopingStrategy =
  | "BREATHING"
  | "CALL_SOMEONE"
  | "COLD_WATER"
  | "DISTRACTION"
  | "EXERCISE"
  | "GUM"
  | "MEDITATION"
  | "OTHER"
  | "PLAY_THE_TAPE"
  | "PRAYER"
  | "QUIT_AID"
  | "SNACK"
  | "SUPPORT_MEETING"
  | "URGE_SURFING"
  | "WAIT_IT_OUT"
  | "WALK"
  | "WATER";

export type Craving = {
  durationMinutes: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  intensity: Scalars["Int"]["output"];
  intensityAfter: Maybe<Scalars["Int"]["output"]>;
  note: Maybe<Scalars["String"]["output"]>;
  outcome: CravingOutcome;
  strategy: Maybe<CopingStrategy>;
  timestamp: Scalars["DateTime"]["output"];
  trigger: CravingTrigger;
};

export type CravingOutcome = "RESISTED" | "SMOKED";

export type CravingTrigger =
  | "AFTER_MEAL"
  | "ALCOHOL"
  | "ANGRY"
  | "ARGUMENT"
  | "BAD_NEWS"
  | "BOREDOM"
  | "CELEBRATION"
  | "COFFEE"
  | "DRIVING"
  | "HUNGRY"
  | "LONELINESS"
  | "OTHER"
  | "PAIN"
  | "PAYDAY"
  | "PEOPLE_PLACES"
  | "PHONE"
  | "SEEING_IT"
  | "SOCIAL"
  | "STRESS"
  | "TIRED"
  | "WAKING_UP"
  | "WORK";

export type DailyCheckInInput = {
  cravingLevel: Scalars["Int"]["input"];
  date: Scalars["String"]["input"];
  energy?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  mood: Scalars["Int"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  sleepQuality?: InputMaybe<Scalars["Int"]["input"]>;
  symptoms?: InputMaybe<Array<WithdrawalSymptom>>;
  weightKg?: InputMaybe<Scalars["Float"]["input"]>;
};

export type DeleteAssessmentInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteCheckInInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteCravingInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteDrinkInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteDrugCheckInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteExclusionInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteGamblingLossInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteIfThenPlanInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteRewardGoalInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteRiskyPlaceInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteSlipInput = {
  id: Scalars["OID"]["input"];
};

export type DoseStep = {
  dose: Scalars["String"]["output"];
  fromDay: Scalars["Int"]["output"];
  id: Scalars["OID"]["output"];
  timesPerDay: Scalars["Int"]["output"];
};

export type DoseStepInput = {
  dose: Scalars["String"]["input"];
  fromDay: Scalars["Int"]["input"];
  id: Scalars["OID"]["input"];
  timesPerDay: Scalars["Int"]["input"];
};

export type DrinkEntry = {
  abvPercent: Scalars["Float"]["output"];
  beverage: BeverageType;
  gramsAlcohol: Scalars["Float"]["output"];
  id: Scalars["OID"]["output"];
  slipId: Scalars["OID"]["output"];
  standardDrinks: Scalars["Float"]["output"];
  timestamp: Scalars["DateTime"]["output"];
  volumeMl: Scalars["Float"]["output"];
};

export type DrugCheck = {
  actions: Array<HarmReductionAction>;
  checkedAt: Scalars["DateTime"]["output"];
  expectedSubstance: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  result: DrugTestResult;
  testType: DrugTestType;
};

export type DrugTestResult = "INCONCLUSIVE" | "NEGATIVE" | "POSITIVE";

export type DrugTestType =
  | "BENZO_STRIP"
  | "CHECKING_SERVICE"
  | "FENTANYL_STRIP"
  | "MEDETOMIDINE_STRIP"
  | "NITAZENE_STRIP"
  | "OTHER"
  | "REAGENT_KIT"
  | "XYLAZINE_STRIP";

export type EndProgramInput = {
  endedAt: Scalars["DateTime"]["input"];
  programId: Scalars["OID"]["input"];
};

export type EndQuitAidInput = {
  endedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
};

export type EndSafetyCheckInput = {
  endedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  outcome: SafetyCheckOutcome;
};

export type Exclusion = {
  endDate: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  scheme: ExclusionScheme;
  startDate: Scalars["String"]["output"];
};

export type ExclusionScheme =
  | "BANK_BLOCK"
  | "BETBLOCKER"
  | "GAMBAN"
  | "GAMSTOP"
  | "OASIS"
  | "OTHER"
  | "VENUE";

export type GamblingLoss = {
  amount: Scalars["Float"]["output"];
  date: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
};

export type HarmReductionAction =
  | "DID_NOT_USE"
  | "DISCARDED"
  | "NALOXONE_READY"
  | "NOT_ALONE"
  | "TOLD_SOMEONE"
  | "USED_LESS"
  | "WENT_SLOWER";

export type IfThenPlan = {
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  ifText: Scalars["String"]["output"];
  lastReviewedAt: Maybe<Scalars["DateTime"]["output"]>;
  strategy: Maybe<CopingStrategy>;
  thenText: Scalars["String"]["output"];
  trigger: Maybe<CravingTrigger>;
};

export type LogAidUseInput = {
  aidId: Scalars["OID"]["input"];
  beforeDrinking?: InputMaybe<Scalars["Boolean"]["input"]>;
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
};

export type LogCravingInput = {
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  intensity: Scalars["Int"]["input"];
  intensityAfter?: InputMaybe<Scalars["Int"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
  outcome: CravingOutcome;
  strategy?: InputMaybe<CopingStrategy>;
  timestamp: Scalars["DateTime"]["input"];
  trigger: CravingTrigger;
};

export type LogDrinkInput = {
  abvPercent: Scalars["Float"]["input"];
  beverage: BeverageType;
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  slipId: Scalars["OID"]["input"];
  timestamp: Scalars["DateTime"]["input"];
  volumeMl: Scalars["Float"]["input"];
};

export type LogDrugCheckInput = {
  actions?: InputMaybe<Array<HarmReductionAction>>;
  checkedAt: Scalars["DateTime"]["input"];
  expectedSubstance?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  result: DrugTestResult;
  testType: DrugTestType;
};

export type LogGamblingLossInput = {
  amount: Scalars["Float"]["input"];
  date: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
};

export type LogScreenTimeInput = {
  date: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  minutes: Scalars["Int"]["input"];
};

export type LogSlipInput = {
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
  trigger?: InputMaybe<CravingTrigger>;
  units: Scalars["Float"]["input"];
};

export type MarkNaloxoneUsedInput = {
  id: Scalars["OID"]["input"];
  usedAt: Scalars["DateTime"]["input"];
};

export type MedicationPlan = {
  aidId: Scalars["OID"]["output"];
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  source: MedicationPlanSource;
  startDate: Scalars["String"]["output"];
  steps: Array<DoseStep>;
};

export type MedicationPlanSource = "CLINICIAN" | "LEAFLET" | "SELF";

export type Motivation = {
  id: Scalars["OID"]["output"];
  imageUrl: Maybe<Scalars["URL"]["output"]>;
  text: Scalars["String"]["output"];
};

export type NaloxoneKind =
  | "AUTO_INJECTOR"
  | "INJECTABLE"
  | "NASAL_SPRAY_4MG"
  | "NASAL_SPRAY_8MG"
  | "OTHER";

export type NaloxoneKit = {
  addedAt: Scalars["DateTime"]["output"];
  expiresOn: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: NaloxoneKind;
  location: Maybe<Scalars["String"]["output"]>;
  usedAt: Maybe<Scalars["DateTime"]["output"]>;
};

export type ProductType =
  | "ALCOHOL"
  | "BENZODIAZEPINES"
  | "CAFFEINE"
  | "CANNABIS"
  | "CIGARETTES"
  | "CIGARS"
  | "GAMBLING"
  | "GAMING"
  | "HEATED_TOBACCO"
  | "KRATOM"
  | "OPIOIDS"
  | "OTHER"
  | "PORNOGRAPHY"
  | "ROLL_YOUR_OWN"
  | "SOCIAL_MEDIA"
  | "STIMULANTS"
  | "SUGAR"
  | "VAPE";

export type ProgramEnrollment = {
  completedMissions: Array<Scalars["String"]["output"]>;
  endedAt: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  program: ProgramKey;
  startedAt: Scalars["DateTime"]["output"];
};

export type ProgramKey =
  | "DAILY_MISSIONS"
  | "DRY_MONTH"
  | "QUIT_VAPING"
  | "SKILL_LESSONS"
  | "T_BREAK";

export type QuitAid = {
  dosage: Maybe<Scalars["String"]["output"]>;
  endedAt: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  startedAt: Scalars["DateTime"]["output"];
  type: QuitAidType;
};

export type QuitAidType =
  | "ACAMPROSATE"
  | "APP_PROGRAM"
  | "BUPRENORPHINE"
  | "BUPROPION"
  | "COUNSELING"
  | "CYTISINE"
  | "DISULFIRAM"
  | "GUM"
  | "INHALER"
  | "LOZENGE"
  | "METHADONE"
  | "MOUTH_SPRAY"
  | "NALTREXONE"
  | "NASAL_SPRAY"
  | "OTHER"
  | "PATCH"
  | "SUPPORT_GROUP"
  | "THERAPY"
  | "VARENICLINE";

export type QuitAttempt = {
  endedAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  quitDateTime: Scalars["DateTime"]["output"];
  reason: Maybe<Scalars["String"]["output"]>;
};

export type QuitJourneyLocalState = {
  riskyPlaces: Maybe<Array<RiskyPlace>>;
  safetyChecks: Maybe<Array<SafetyCheck>>;
};

export type QuitJourneyState = {
  aidUses: Array<AidUse>;
  aids: Array<QuitAid>;
  assessments: Maybe<Array<Assessment>>;
  checkIns: Array<CheckIn>;
  cravings: Array<Craving>;
  displayName: Maybe<Scalars["String"]["output"]>;
  drinks: Maybe<Array<DrinkEntry>>;
  drugChecks: Maybe<Array<DrugCheck>>;
  exclusions: Maybe<Array<Exclusion>>;
  gamblingLosses: Maybe<Array<GamblingLoss>>;
  ifThenPlans: Maybe<Array<IfThenPlan>>;
  medicationPlans: Maybe<Array<MedicationPlan>>;
  motivations: Array<Motivation>;
  naloxoneKits: Maybe<Array<NaloxoneKit>>;
  pastAttempts: Array<QuitAttempt>;
  plan: Maybe<QuitPlan>;
  prepTasksDone: Array<Scalars["String"]["output"]>;
  programs: Maybe<Array<ProgramEnrollment>>;
  quitlinePhone: Maybe<Scalars["String"]["output"]>;
  rewards: Array<RewardGoal>;
  screenTime: Maybe<Array<ScreenTimeEntry>>;
  slips: Array<Slip>;
  supportContacts: Array<SupportContact>;
  takeHomes: Maybe<Array<TakeHome>>;
};

export type QuitPlan = {
  currency: Scalars["Currency"]["output"];
  customName: Maybe<Scalars["String"]["output"]>;
  dailyLimit: Maybe<Scalars["Float"]["output"]>;
  goal: Maybe<RecoveryGoal>;
  packPrice: Scalars["Float"]["output"];
  productType: ProductType;
  quitDateTime: Scalars["DateTime"]["output"];
  standardDrinkGrams: Maybe<Scalars["Float"]["output"]>;
  unitLabel: Maybe<Scalars["String"]["output"]>;
  unitsPerDay: Scalars["Float"]["output"];
  unitsPerPack: Scalars["Int"]["output"];
  yearsSmoked: Maybe<Scalars["Float"]["output"]>;
};

export type RecordAssessmentInput = {
  answers: Array<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  instrument: AssessmentInstrument;
  takenAt: Scalars["DateTime"]["input"];
};

export type RecordTakeHomeInput = {
  aidId: Scalars["OID"]["input"];
  doses: Scalars["Int"]["input"];
  id: Scalars["OID"]["input"];
  pickedUpOn: Scalars["String"]["input"];
};

export type RecoveryGoal = "ABSTINENCE" | "REDUCTION";

export type RemoveMotivationInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveNaloxoneKitInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveSupportContactInput = {
  id: Scalars["OID"]["input"];
};

export type RestartJourneyInput = {
  attemptId: Scalars["OID"]["input"];
  endedAt: Scalars["DateTime"]["input"];
  newQuitDateTime: Scalars["DateTime"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type ReviewIfThenPlanInput = {
  id: Scalars["OID"]["input"];
  reviewedAt: Scalars["DateTime"]["input"];
};

export type RewardGoal = {
  claimedAt: Maybe<Scalars["DateTime"]["output"]>;
  cost: Scalars["Float"]["output"];
  emoji: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  title: Scalars["String"]["output"];
};

export type RiskyPlace = {
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
  lat: Scalars["Float"]["output"];
  lng: Scalars["Float"]["output"];
  planId: Maybe<Scalars["OID"]["output"]>;
  radiusM: Scalars["Int"]["output"];
};

export type SafetyCheck = {
  contactIds: Array<Scalars["OID"]["output"]>;
  durationMinutes: Scalars["Int"]["output"];
  endedAt: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  outcome: SafetyCheckOutcome;
  startedAt: Scalars["DateTime"]["output"];
};

export type SafetyCheckOutcome = "ACTIVE" | "ALARM" | "CANCELLED" | "OK";

export type ScreenTimeEntry = {
  date: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  minutes: Scalars["Int"]["output"];
};

export type SetDisplayNameInput = {
  displayName?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetMedicationPlanInput = {
  aidId: Scalars["OID"]["input"];
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  source: MedicationPlanSource;
  startDate: Scalars["String"]["input"];
  steps: Array<DoseStepInput>;
};

export type SetQuitPlanInput = {
  currency: Scalars["Currency"]["input"];
  customName?: InputMaybe<Scalars["String"]["input"]>;
  dailyLimit?: InputMaybe<Scalars["Float"]["input"]>;
  goal?: InputMaybe<RecoveryGoal>;
  packPrice: Scalars["Float"]["input"];
  productType: ProductType;
  quitDateTime: Scalars["DateTime"]["input"];
  standardDrinkGrams?: InputMaybe<Scalars["Float"]["input"]>;
  unitLabel?: InputMaybe<Scalars["String"]["input"]>;
  unitsPerDay: Scalars["Float"]["input"];
  unitsPerPack: Scalars["Int"]["input"];
  yearsSmoked?: InputMaybe<Scalars["Float"]["input"]>;
};

export type SetQuitlineInput = {
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type Slip = {
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["DateTime"]["output"];
  trigger: Maybe<CravingTrigger>;
  units: Scalars["Float"]["output"];
};

export type StartProgramInput = {
  id: Scalars["OID"]["input"];
  program: ProgramKey;
  startedAt: Scalars["DateTime"]["input"];
};

export type StartSafetyCheckInput = {
  contactIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  durationMinutes: Scalars["Int"]["input"];
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  startedAt: Scalars["DateTime"]["input"];
};

export type SupportContact = {
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  phone: Maybe<Scalars["String"]["output"]>;
  relation: Maybe<Scalars["String"]["output"]>;
};

export type TakeHome = {
  aidId: Scalars["OID"]["output"];
  doses: Scalars["Int"]["output"];
  id: Scalars["OID"]["output"];
  pickedUpOn: Scalars["String"]["output"];
};

export type TogglePrepTaskInput = {
  done: Scalars["Boolean"]["input"];
  taskKey: Scalars["String"]["input"];
};

export type UpdateIfThenPlanInput = {
  id: Scalars["OID"]["input"];
  ifText: Scalars["String"]["input"];
  strategy?: InputMaybe<CopingStrategy>;
  thenText: Scalars["String"]["input"];
  trigger?: InputMaybe<CravingTrigger>;
};

export type WithdrawalSymptom =
  | "ANHEDONIA"
  | "ANXIETY"
  | "CHILLS"
  | "CONSTIPATION"
  | "COUGH"
  | "DIARRHEA"
  | "DIZZINESS"
  | "HEADACHE"
  | "HUNGER"
  | "INSOMNIA"
  | "IRRITABILITY"
  | "LOW_MOOD"
  | "MUSCLE_ACHES"
  | "NAUSEA"
  | "POOR_CONCENTRATION"
  | "RESTLESSNESS"
  | "SWEATING"
  | "TREMOR"
  | "VIVID_DREAMS";
