import type {
  AssessmentInstrument,
  BeverageType,
  CravingTrigger,
  IfThenPlan,
  ProductType,
  ProgramKey,
} from "document-models/quit-journey/v1";

// ---------- assessments ----------

export interface AssessmentOption {
  value: number;
  label: string;
}

export interface AssessmentItem {
  text: string;
  /** Answer options; their values must stay within the reducer's [min, max] for the instrument. */
  options: AssessmentOption[];
}

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  /** Neutral, non-diagnostic explanation. */
  description: string;
  /** "high" bands show a "talk to a professional" prompt. */
  level: "low" | "moderate" | "high";
}

export interface AssessmentDefinition {
  instrument: AssessmentInstrument;
  name: string;
  /** What it measures in plain words. */
  purpose: string;
  /** Which journeys it is offered for. */
  appliesTo: ProductType[];
  kind: "SCREEN" | "WITHDRAWAL" | "RECOVERY_CAPITAL";
  /** How often to suggest retaking it, in days (withdrawal scales: 1). */
  retakeDays: number;
  items: AssessmentItem[];
  bands: ScoreBand[];
  citation: string;
  /** false = licence not yet confirmed; hidden unless the build enables unlicensed instruments. */
  licensed: boolean;
}

export interface AssessmentResult {
  instrument: AssessmentInstrument;
  score: number;
  maxScore: number;
  band: ScoreBand | null;
  /** Escalate to SOS / emergency guidance (e.g. severe withdrawal). */
  redFlag: boolean;
}

// ---------- programs ----------

export interface Mission {
  key: string;
  /** Day of the program this mission unlocks (1-based). */
  day: number;
  title: string;
  body: string;
}

export interface ProgramDefinition {
  key: ProgramKey;
  name: string;
  summary: string;
  appliesTo: ProductType[];
  lengthDays: number;
  missions: Mission[];
  evidence: string;
}

export interface ProgramStatus {
  enrollmentId: string;
  definition: ProgramDefinition;
  day: number;
  completed: number;
  total: number;
  /** Unlocked but not completed missions, oldest first. */
  due: Mission[];
  finished: boolean;
}

// ---------- reward ladder (contingency-management style, self-report) ----------

export interface RewardLadder {
  /** Consecutive slip-free calendar days ending today. */
  streakDays: number;
  /** Points earned for today (escalating), 0 when not yet earned. */
  todayPoints: number;
  totalPoints: number;
  /** Points tomorrow will be worth if the streak holds. */
  nextPoints: number;
  /** True right after a reset, until 3 clean days restore the previous level. */
  recovering: boolean;
  /** Days left until the previous level is restored (0 when not recovering). */
  restoreInDays: number;
}

// ---------- harm reduction ----------

export interface NaloxoneStatus {
  kitId: string;
  daysToExpiry: number | null;
  state: "OK" | "EXPIRING" | "EXPIRED" | "USED";
}

export interface ExclusionStatus {
  exclusionId: string;
  daysLeft: number | null;
  state: "ACTIVE" | "ENDING_SOON" | "ENDED" | "OPEN_ENDED";
}

export interface SupplyAlert {
  key: string;
  title: string;
  body: string;
  appliesTo: ProductType[];
  /** YYYY-MM-DD the content was last checked. */
  reviewedOn: string;
  source: string;
}

export interface ProtectionLink {
  key: string;
  name: string;
  region: string;
  description: string;
  url: string;
  appliesTo: ProductType[];
}

export interface HelplineEntry {
  key: string;
  name: string;
  region: string;
  phone: string;
  appliesTo: ProductType[] | "ALL";
  reviewedOn: string;
}

// ---------- medication ----------

export interface MedicationToday {
  aidId: string;
  day: number;
  dose: string;
  timesPerDay: number;
  takenToday: number;
  /** Take-home doses picked up minus doses logged since the first pick-up; null without take-homes. */
  takeHomeRemaining: number | null;
}

// ---------- tracking ----------

export interface StandardDrinkDefinition {
  country: string;
  grams: number;
  /** Where the definition comes from (optional, added later). */
  source?: string;
}

export interface DrinkWeek {
  standardDrinks: number;
  gramsAlcohol: number;
  drinkingDays: number;
}

// ---------- plans ----------

export type PlanMatcher = (plans: IfThenPlan[], trigger: CravingTrigger | null) => IfThenPlan[];

// ---------- additions ----------

export interface DrinkEstimate {
  gramsAlcohol: number;
  standardDrinks: number;
}

export interface DrinkPreset {
  key: string;
  label: string;
  beverage: BeverageType;
  volumeMl: number;
  abvPercent: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface JourneyToolkit {
  ladder: RewardLadder;
  naloxone: NaloxoneStatus[];
  exclusions: ExclusionStatus[];
  /** Active (not ended) programs only. */
  programs: ProgramStatus[];
  medication: MedicationToday[];
  /** ALCOHOL journeys only. */
  drinkWeek: DrinkWeek | null;
  /** Supply alerts for this journey's product. */
  alerts: SupplyAlert[];
  latestAssessments: Partial<Record<AssessmentInstrument, AssessmentResult & { takenAt: string }>>;
}
