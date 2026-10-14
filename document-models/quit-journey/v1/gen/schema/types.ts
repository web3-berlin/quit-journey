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

export type AddMotivationInput = {
  id: Scalars["OID"]["input"];
  imageUrl?: InputMaybe<Scalars["URL"]["input"]>;
  text: Scalars["String"]["input"];
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

export type AddSupportContactInput = {
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  relation?: InputMaybe<Scalars["String"]["input"]>;
};

export type AidUse = {
  aidId: Scalars["OID"]["output"];
  id: Scalars["OID"]["output"];
  note: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["DateTime"]["output"];
};

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

export type CopingStrategy =
  | "BREATHING"
  | "CALL_SOMEONE"
  | "DISTRACTION"
  | "EXERCISE"
  | "GUM"
  | "MEDITATION"
  | "OTHER"
  | "QUIT_AID"
  | "SNACK"
  | "WAIT_IT_OUT"
  | "WALK"
  | "WATER";

export type Craving = {
  durationMinutes: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  intensity: Scalars["Int"]["output"];
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
  | "ARGUMENT"
  | "BOREDOM"
  | "CELEBRATION"
  | "COFFEE"
  | "DRIVING"
  | "LONELINESS"
  | "OTHER"
  | "PHONE"
  | "SOCIAL"
  | "STRESS"
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

export type DeleteCheckInInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteCravingInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteRewardGoalInput = {
  id: Scalars["OID"]["input"];
};

export type DeleteSlipInput = {
  id: Scalars["OID"]["input"];
};

export type EndQuitAidInput = {
  endedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
};

export type LogAidUseInput = {
  aidId: Scalars["OID"]["input"];
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
};

export type LogCravingInput = {
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  intensity: Scalars["Int"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  outcome: CravingOutcome;
  strategy?: InputMaybe<CopingStrategy>;
  timestamp: Scalars["DateTime"]["input"];
  trigger: CravingTrigger;
};

export type LogSlipInput = {
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
  trigger?: InputMaybe<CravingTrigger>;
  units: Scalars["Float"]["input"];
};

export type Motivation = {
  id: Scalars["OID"]["output"];
  imageUrl: Maybe<Scalars["URL"]["output"]>;
  text: Scalars["String"]["output"];
};

export type ProductType =
  | "CIGARETTES"
  | "CIGARS"
  | "HEATED_TOBACCO"
  | "OTHER"
  | "ROLL_YOUR_OWN"
  | "VAPE";

export type QuitAid = {
  dosage: Maybe<Scalars["String"]["output"]>;
  endedAt: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  startedAt: Scalars["DateTime"]["output"];
  type: QuitAidType;
};

export type QuitAidType =
  | "APP_PROGRAM"
  | "BUPROPION"
  | "COUNSELING"
  | "CYTISINE"
  | "GUM"
  | "INHALER"
  | "LOZENGE"
  | "MOUTH_SPRAY"
  | "NASAL_SPRAY"
  | "OTHER"
  | "PATCH"
  | "VARENICLINE";

export type QuitAttempt = {
  endedAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  quitDateTime: Scalars["DateTime"]["output"];
  reason: Maybe<Scalars["String"]["output"]>;
};

export type QuitJourneyState = {
  aidUses: Array<AidUse>;
  aids: Array<QuitAid>;
  checkIns: Array<CheckIn>;
  cravings: Array<Craving>;
  displayName: Maybe<Scalars["String"]["output"]>;
  motivations: Array<Motivation>;
  pastAttempts: Array<QuitAttempt>;
  plan: Maybe<QuitPlan>;
  prepTasksDone: Array<Scalars["String"]["output"]>;
  quitlinePhone: Maybe<Scalars["String"]["output"]>;
  rewards: Array<RewardGoal>;
  slips: Array<Slip>;
  supportContacts: Array<SupportContact>;
};

export type QuitPlan = {
  currency: Scalars["Currency"]["output"];
  packPrice: Scalars["Float"]["output"];
  productType: ProductType;
  quitDateTime: Scalars["DateTime"]["output"];
  unitsPerDay: Scalars["Float"]["output"];
  unitsPerPack: Scalars["Int"]["output"];
  yearsSmoked: Maybe<Scalars["Float"]["output"]>;
};

export type RemoveMotivationInput = {
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

export type RewardGoal = {
  claimedAt: Maybe<Scalars["DateTime"]["output"]>;
  cost: Scalars["Float"]["output"];
  emoji: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  title: Scalars["String"]["output"];
};

export type SetDisplayNameInput = {
  displayName?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetQuitPlanInput = {
  currency: Scalars["Currency"]["input"];
  packPrice: Scalars["Float"]["input"];
  productType: ProductType;
  quitDateTime: Scalars["DateTime"]["input"];
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

export type SupportContact = {
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  phone: Maybe<Scalars["String"]["output"]>;
  relation: Maybe<Scalars["String"]["output"]>;
};

export type TogglePrepTaskInput = {
  done: Scalars["Boolean"]["input"];
  taskKey: Scalars["String"]["input"];
};

export type WithdrawalSymptom =
  | "ANXIETY"
  | "CONSTIPATION"
  | "COUGH"
  | "DIZZINESS"
  | "HEADACHE"
  | "HUNGER"
  | "INSOMNIA"
  | "IRRITABILITY"
  | "LOW_MOOD"
  | "POOR_CONCENTRATION"
  | "RESTLESSNESS";
