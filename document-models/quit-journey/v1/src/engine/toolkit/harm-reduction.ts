import type { ProductType, QuitJourneyState } from "document-models/quit-journey/v1";
import { localDateKey } from "../time.js";
import { NICOTINE_PRODUCTS, daysBetweenDateKeys, toDateKey } from "./dates.js";
import type { ExclusionStatus, HelplineEntry, NaloxoneStatus, ProtectionLink, SupplyAlert } from "./types.js";

export const NALOXONE_EXPIRING_DAYS = 60;
export const EXCLUSION_ENDING_DAYS = 14;

/** Kit expiry by local calendar day: EXPIRING within 60 days (including the expiry day), EXPIRED after it. */
export function naloxoneStatuses(state: QuitJourneyState, now: number): NaloxoneStatus[] {
  const today = localDateKey(now);
  return (state.naloxoneKits ?? []).map((kit) => {
    const daysToExpiry = kit.expiresOn ? daysBetweenDateKeys(today, toDateKey(kit.expiresOn)) : null;
    let status: NaloxoneStatus["state"] = "OK";
    if (kit.usedAt) status = "USED";
    else if (daysToExpiry !== null && daysToExpiry < 0) status = "EXPIRED";
    else if (daysToExpiry !== null && daysToExpiry <= NALOXONE_EXPIRING_DAYS) status = "EXPIRING";
    return { kitId: kit.id, daysToExpiry, state: status };
  });
}

/** Self-exclusions: ENDING_SOON within 14 days (including the end day), ENDED after it, OPEN_ENDED without an end date. */
export function exclusionStatuses(state: QuitJourneyState, now: number): ExclusionStatus[] {
  const today = localDateKey(now);
  return (state.exclusions ?? []).map((ex) => {
    if (!ex.endDate) return { exclusionId: ex.id, daysLeft: null, state: "OPEN_ENDED" };
    const daysLeft = daysBetweenDateKeys(today, toDateKey(ex.endDate));
    const status: ExclusionStatus["state"] =
      daysLeft < 0 ? "ENDED" : daysLeft <= EXCLUSION_ENDING_DAYS ? "ENDING_SOON" : "ACTIVE";
    return { exclusionId: ex.id, daysLeft, state: status };
  });
}

// ---------- drug supply alerts ----------

const REVIEWED = "2026-10-15";
const OPIOID_SUPPLY: ProductType[] = ["OPIOIDS", "KRATOM", "BENZODIAZEPINES", "STIMULANTS"];

export const SUPPLY_ALERTS: SupplyAlert[] = [
  {
    key: "medetomidine",
    title: "Medetomidine in the US fentanyl supply",
    body: "In parts of the US, the sedative medetomidine has largely replaced xylazine in street fentanyl. Pennsylvania drug checking found it in about 95% of fentanyl samples in Q2 2025, and Philadelphia in over 70%. Withdrawal from it can be severe and may need hospital care, so get medical help early.",
    appliesTo: ["OPIOIDS"],
    reviewedOn: REVIEWED,
    source: "https://hip.phila.gov/document/5444/PDPH-HAN-SUPHR-Medetomidine-06.10.2025_1Zu1OZ4.pdf",
  },
  {
    key: "xylazine-wounds",
    title: "Xylazine can cause serious wounds",
    body: "Xylazine (\"tranq\") can cause wounds that heal slowly, sometimes away from where you inject. Keep wounds clean and covered, and get medical care for spreading redness, fever or blackened skin. Naloxone does not reverse xylazine, but always give it for a suspected overdose.",
    appliesTo: ["OPIOIDS"],
    reviewedOn: REVIEWED,
    source: "https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html",
  },
  {
    key: "nitazenes",
    title: "Nitazenes: stronger than fentanyl",
    body: "Nitazene opioids have been found in at least 37 countries, in heroin, fake pills and other drugs. Fentanyl strips do not detect them, and nitazene strips miss some types. Use less, go slow, never use alone and keep naloxone close.",
    appliesTo: OPIOID_SUPPLY,
    reviewedOn: REVIEWED,
    source: "https://www.unodc.org/LSS/Announcement/Details/e69b2ff5-5b91-4eea-8e1f-802ca7ad5080",
  },
  {
    key: "fentanyl-in-stimulants",
    title: "Fentanyl in cocaine and meth",
    body: "Fentanyl is turning up in cocaine, meth and pressed pills, so people who don't use opioids can overdose too. Test if you can, don't use alone and carry naloxone.",
    appliesTo: ["STIMULANTS", "BENZODIAZEPINES"],
    reviewedOn: REVIEWED,
    source: "https://www.dea.gov/resources/facts-about-fentanyl",
  },
  {
    key: "negative-strip",
    title: "A negative strip doesn't mean safe",
    body: "Test strips only look for specific substances and can miss others or give false negatives. Treat every unknown supply with care: start low, go slow and have naloxone and someone with you.",
    appliesTo: OPIOID_SUPPLY,
    reviewedOn: REVIEWED,
    source: "https://www.dundee.ac.uk/press-release/drug-testing-kits-could-fail-keep-individuals-safe",
  },
];

export function supplyAlertsFor(product: ProductType): SupplyAlert[] {
  return SUPPLY_ALERTS.filter((a) => a.appliesTo.includes(product));
}

// ---------- protection tools ----------

const DRUGS: ProductType[] = ["OPIOIDS", "STIMULANTS", "BENZODIAZEPINES", "KRATOM"];
const SUBSTANCES: ProductType[] = ["ALCOHOL", "CANNABIS", "OPIOIDS", "STIMULANTS", "BENZODIAZEPINES", "KRATOM", "OTHER"];

export const PROTECTION_LINKS: ProtectionLink[] = [
  {
    key: "gamstop",
    name: "GAMSTOP",
    region: "UK",
    description: "Free self-exclusion from all online gambling sites licensed in Great Britain.",
    url: "https://www.gamstop.co.uk/",
    appliesTo: ["GAMBLING"],
  },
  {
    key: "oasis",
    name: "OASIS Spielersperre",
    region: "DE",
    description: "Germany's national gambling self-exclusion system, run by the Regierungspräsidium Darmstadt.",
    url: "https://rp-darmstadt.hessen.de/sicherheit-und-kommunales/gluecksspiel/spielersperrsystem-oasis",
    appliesTo: ["GAMBLING"],
  },
  {
    key: "betblocker",
    name: "BetBlocker",
    region: "Worldwide",
    description: "Free app that blocks gambling websites and apps on your devices.",
    url: "https://betblocker.org/",
    appliesTo: ["GAMBLING"],
  },
  {
    key: "gamban",
    name: "Gamban",
    region: "Worldwide",
    description: "Blocking software for gambling sites and apps (free through many UK banks and services).",
    url: "https://gamban.com/",
    appliesTo: ["GAMBLING"],
  },
  {
    key: "bank-blocks",
    name: "Bank card gambling blocks",
    region: "UK",
    description: "Many banks let you block card payments to gambling companies in their app. This report explains how the blocks work.",
    url: "https://www.bristol.ac.uk/media-library/sites/geography/pfrc/A%20Blueprint%20for%20Bank%20Card%20Gambling%20Blockers%20-%20Report.pdf",
    appliesTo: ["GAMBLING"],
  },
  {
    key: "never-use-alone",
    name: "Never Use Alone",
    region: "US",
    description: "Call 800-484-3731 before using. They stay on the line and send help to your location if you stop responding.",
    url: "https://neverusealone.com/",
    appliesTo: DRUGS,
  },
  {
    key: "nors",
    name: "National Overdose Response Service (NORS)",
    region: "CA",
    description: "Call 1-888-688-6677 before using. A peer stays on the line and sends help if you stop responding.",
    url: "https://www.nors.ca/",
    appliesTo: DRUGS,
  },
  {
    key: "next-distro",
    name: "NEXT Distro",
    region: "US",
    description: "Free naloxone and safer-use supplies by mail in many US states.",
    url: "https://nextdistro.org/",
    appliesTo: DRUGS,
  },
  {
    key: "naloxone-finder",
    name: "Harm reduction near you",
    region: "US",
    description: "National Harm Reduction Coalition's map of programs offering naloxone and other services.",
    url: "https://harmreduction.org/resource-center/harm-reduction-near-you/",
    appliesTo: DRUGS,
  },
  {
    key: "aa-meeting-guide",
    name: "AA Meeting Guide",
    region: "Worldwide",
    description: "Free app to find Alcoholics Anonymous meetings near you or online.",
    url: "https://www.aa.org/meeting-guide-app",
    appliesTo: ["ALCOHOL"],
  },
  {
    key: "na",
    name: "Narcotics Anonymous",
    region: "Worldwide",
    description: "Find NA meetings near you or online.",
    url: "https://na.org/meetingsearch/",
    appliesTo: ["OPIOIDS", "STIMULANTS", "BENZODIAZEPINES", "CANNABIS", "KRATOM", "OTHER"],
  },
  {
    key: "smart-recovery",
    name: "SMART Recovery",
    region: "Worldwide",
    description: "Science-based mutual-help meetings, in person and online, for any addictive behaviour.",
    url: "https://www.smartrecovery.org/",
    appliesTo: [...SUBSTANCES, "GAMBLING", "GAMING", "PORNOGRAPHY", "SOCIAL_MEDIA"],
  },
];

export function protectionLinksFor(product: ProductType): ProtectionLink[] {
  return PROTECTION_LINKS.filter((l) => l.appliesTo.includes(product));
}

// ---------- helplines (numbers checked 2026-10-15) ----------

export const HELPLINES: HelplineEntry[] = [
  { key: "samhsa", name: "SAMHSA National Helpline", region: "US", phone: "1-800-662-4357", appliesTo: "ALL", reviewedOn: REVIEWED },
  { key: "988", name: "988 Suicide & Crisis Lifeline", region: "US", phone: "988", appliesTo: "ALL", reviewedOn: REVIEWED },
  { key: "frank", name: "FRANK", region: "UK", phone: "0300 123 6600", appliesTo: SUBSTANCES, reviewedOn: REVIEWED },
  {
    key: "uk-gambling",
    name: "National Gambling Helpline (GamCare)",
    region: "UK",
    phone: "0808 8020 133",
    appliesTo: ["GAMBLING"],
    reviewedOn: REVIEWED,
  },
  {
    // 1-800-GAMBLER is now run only by the Council on Compulsive Gambling of New Jersey; NCPG moved to 1-800-MY-RESET.
    key: "us-gambling",
    name: "National Problem Gambling Helpline (1-800-MY-RESET)",
    region: "US",
    phone: "1-800-697-3738",
    appliesTo: ["GAMBLING"],
    reviewedOn: REVIEWED,
  },
  {
    key: "de-sucht-drogen",
    name: "Sucht & Drogen Hotline (BIÖG, formerly BZgA)",
    region: "DE",
    phone: "01806 313031",
    appliesTo: SUBSTANCES,
    reviewedOn: REVIEWED,
  },
  {
    key: "de-gambling",
    name: "Telefonberatung Glücksspielsucht (BIÖG)",
    region: "DE",
    phone: "0800 1 37 27 00",
    appliesTo: ["GAMBLING"],
    reviewedOn: REVIEWED,
  },
  { key: "nhs-smokefree", name: "NHS Smokefree Helpline (England)", region: "UK", phone: "0300 123 1044", appliesTo: NICOTINE_PRODUCTS, reviewedOn: REVIEWED },
  { key: "never-use-alone", name: "Never Use Alone", region: "US", phone: "800-484-3731", appliesTo: DRUGS, reviewedOn: REVIEWED },
  { key: "nors", name: "National Overdose Response Service", region: "CA", phone: "1-888-688-6677", appliesTo: DRUGS, reviewedOn: REVIEWED },
];

export function helplinesFor(product: ProductType): HelplineEntry[] {
  return HELPLINES.filter((h) => h.appliesTo === "ALL" || h.appliesTo.includes(product));
}
