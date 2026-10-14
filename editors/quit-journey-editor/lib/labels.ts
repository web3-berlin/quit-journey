import type {
  CopingStrategy,
  CravingTrigger,
  ProductType,
  QuitAidType,
  WithdrawalSymptom,
} from "document-models/quit-journey";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  CIGARETTES: "Cigarettes",
  ROLL_YOUR_OWN: "Roll-your-own",
  CIGARS: "Cigars",
  VAPE: "Vape",
  HEATED_TOBACCO: "Heated tobacco",
  OTHER: "Other",
};

export const TRIGGER_LABELS: Record<CravingTrigger, string> = {
  STRESS: "Stress",
  COFFEE: "Coffee",
  ALCOHOL: "Alcohol",
  AFTER_MEAL: "After a meal",
  BOREDOM: "Boredom",
  SOCIAL: "Around smokers",
  WORK: "Work break",
  DRIVING: "Driving",
  WAKING_UP: "Waking up",
  PHONE: "On the phone",
  ARGUMENT: "Argument",
  CELEBRATION: "Celebrating",
  LONELINESS: "Feeling lonely",
  OTHER: "Something else",
};

export const STRATEGY_LABELS: Record<CopingStrategy, string> = {
  BREATHING: "Deep breathing",
  WALK: "Went for a walk",
  WATER: "Glass of water",
  SNACK: "Healthy snack",
  GUM: "Chewing gum",
  CALL_SOMEONE: "Called someone",
  DISTRACTION: "Distraction",
  EXERCISE: "Exercise",
  MEDITATION: "Meditation",
  QUIT_AID: "Used my quit aid",
  WAIT_IT_OUT: "Waited it out",
  OTHER: "Something else",
};

export const AID_LABELS: Record<QuitAidType, string> = {
  PATCH: "Nicotine patch",
  GUM: "Nicotine gum",
  LOZENGE: "Lozenge",
  INHALER: "Inhaler",
  MOUTH_SPRAY: "Mouth spray",
  NASAL_SPRAY: "Nasal spray",
  VARENICLINE: "Varenicline",
  BUPROPION: "Bupropion",
  CYTISINE: "Cytisine",
  COUNSELING: "Counseling",
  APP_PROGRAM: "Support program",
  OTHER: "Other",
};

export const SYMPTOM_LABELS: Record<WithdrawalSymptom, string> = {
  IRRITABILITY: "Irritable",
  ANXIETY: "Anxious",
  RESTLESSNESS: "Restless",
  INSOMNIA: "Poor sleep",
  HUNGER: "Hungry",
  HEADACHE: "Headache",
  LOW_MOOD: "Low mood",
  POOR_CONCENTRATION: "Foggy",
  COUGH: "Coughing",
  CONSTIPATION: "Constipation",
  DIZZINESS: "Dizzy",
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function entries<K extends string>(labels: Record<K, string>): [K, string][] {
  return Object.entries(labels) as [K, string][];
}
