import type { ProductType, ProgramEnrollment, ProgramKey } from "document-models/quit-journey/v1";
import { localDateKey } from "../time.js";
import { ALL_PRODUCTS, NICOTINE_PRODUCTS, daysBetweenDateKeys, toDateKey } from "./dates.js";
import type { Mission, ProgramDefinition, ProgramStatus } from "./types.js";

type Raw = [day: number, title: string, body: string];

const missions = (prefix: string, list: Raw[]): Mission[] =>
  list.map(([day, title, body], i) => ({ key: `${prefix}-${String(i + 1).padStart(2, "0")}`, day, title, body }));

// ---------- Quit vaping: prepare (days 1-7), quit day (8), after (9-30) ----------

const QUIT_VAPING = missions("qv", [
  [1, "Write down your why", "List three reasons you want to stop vaping. Keep the list on your phone's lock screen or somewhere you'll see it often."],
  [2, "Notice when you vape", "Today, just notice each time you reach for your vape. What were you doing and feeling?"],
  [3, "Pick your quit day", "Choose a day within the next week. A calmer day, without big deadlines or parties, makes the start easier."],
  [4, "Tell someone you trust", "Let a friend or family member know your quit day. Ask them to check in on you that week."],
  [5, "Plan for your top trigger", "Pick the moment you vape most and decide what you'll do instead, like a walk, gum or a glass of water."],
  [6, "Talk to a pharmacist", "Nicotine patches, gum or lozenges can take the edge off cravings. A pharmacist or doctor can help you choose."],
  [7, "Clear out your gear", "Tonight, throw away pods, chargers and spare devices. Fewer reminders mean fewer decisions tomorrow."],
  [8, "Quit day is here", "Today you don't vape. When a craving hits, remember it peaks and passes within a few minutes."],
  [9, "Ride out a craving", "When an urge comes, breathe slowly in for four and out for six until it fades. Log how long it lasted."],
  [10, "Change one routine", "Shift a habit linked to vaping, like taking a different route or having tea instead of coffee."],
  [11, "Move your body", "Ten minutes of brisk walking can cut cravings and lift your mood."],
  [12, "Expect some grumpiness", "Irritability and poor sleep are normal in the first weeks. They are signs your brain is adjusting."],
  [14, "Two weeks: reward yourself", "Spend some of the money you've saved on something that makes you smile."],
  [16, "Handle social pressure", "Practise a simple line, like \"No thanks, I've stopped.\" Saying it out loud first makes it easier."],
  [18, "Look after your sleep", "Keep a regular bedtime and cut caffeine after lunch. Better sleep means fewer cravings."],
  [21, "Three weeks strong", "Look back at your logged cravings. Notice how they've become shorter or less frequent."],
  [24, "Plan for a slip", "If you vape once, it doesn't undo your progress. Decide now what you'll do to get straight back on track."],
  [27, "Help someone else", "Share one tip that worked for you with someone who's thinking about quitting."],
  [30, "Thirty days vape-free", "Celebrate. Write down what helped most so you can come back to it if things get hard."],
]);

// ---------- Daily missions for every nicotine product (30 days) ----------

const DAILY_MISSIONS = missions("dm", [
  [1, "Drink a big glass of water", "Water helps with dry mouth and gives your hands something to do."],
  [2, "Take five slow breaths", "Next time you crave, breathe in through your nose and out slowly through your mouth, five times."],
  [3, "Delay one craving", "When a craving comes, wait ten minutes before deciding anything. It will usually pass."],
  [4, "Go for a short walk", "Walk for ten minutes. Moving is one of the quickest ways to ease an urge."],
  [5, "Count your savings", "Check how much money you've kept so far and pick something to spend it on."],
  [6, "Clean one space", "Wash your car, jacket or the corner where you used to smoke, so it smells fresh."],
  [7, "One week: tell someone", "Share your first week with someone who will cheer you on."],
  [8, "Try a healthy snack", "Keep fruit, nuts or carrot sticks nearby for when your hands get restless."],
  [9, "Swap your coffee break", "If coffee and nicotine go together, try tea or change where you take your break."],
  [10, "Name your trigger", "Write down the situation that tempted you most today and one way to handle it next time."],
  [11, "Listen to music", "Put on a song you love when a craving starts and let it carry you through."],
  [12, "Stretch for five minutes", "Gentle stretching releases tension that can feel like a craving."],
  [13, "Write to future you", "Write a short note about how you feel today to read on a hard day."],
  [14, "Two weeks: treat yourself", "Use some of your savings on something small that feels good."],
  [15, "Notice your senses", "Pay attention to how food tastes and how things smell. They are already improving."],
  [16, "Keep your hands busy", "Carry a stress ball, pen or fidget toy to hold when the old habit kicks in."],
  [17, "Plan a busy evening", "Fill a risky time slot with something you enjoy, like cooking, a call or a film."],
  [18, "Breathe in fresh air", "Step outside and take a few deep breaths. Notice how your lungs feel."],
  [19, "Say no once", "Practise turning down an offer, out loud or in your head, before you need to."],
  [20, "Get to bed earlier", "Good sleep makes cravings weaker. Aim for 30 minutes earlier tonight."],
  [21, "Three weeks: look back", "Read your craving log. Notice which tricks worked best for you."],
  [22, "Try something new", "Do one small new thing today. New routines help you leave old ones behind."],
  [23, "Thank your supporter", "Send a message to someone who has helped you this month."],
  [24, "Do a body check", "Notice your breathing, energy and skin. Write down one change you've felt."],
  [25, "Make a slip plan", "Decide what you'll do if you slip, so one puff stays one puff."],
  [26, "Move for twenty minutes", "Walk, cycle, dance or swim. Exercise helps your mood and your lungs."],
  [27, "Share a tip", "Tell someone else who is quitting one thing that worked for you."],
  [28, "Count it up", "Add up the money and time you've kept this month."],
  [29, "Picture next month", "Imagine yourself a month from now, still nicotine-free. What will be different?"],
  [30, "Thirty days: celebrate", "You did it. Plan a proper treat and keep going one day at a time."],
]);

// ---------- Dry month (31 days, alcohol) ----------

const DRY_MONTH = missions("dry", [
  [1, "Set your intention", "Write down why you're taking a month off drinking and what you hope to notice."],
  [2, "Stock your fridge", "Buy alcohol-free drinks you enjoy, like sparkling water, kombucha or alcohol-free beer."],
  [3, "Tell your people", "Let friends know you're having a dry month, so they can support rather than tempt you."],
  [4, "Plan your evenings", "Pick something for the evenings you'd usually drink, like a class, film or walk."],
  [5, "Notice your sleep", "Write down how you slept. Many people sleep more deeply within the first week."],
  [7, "One week: reward yourself", "Put the money you'd have spent on drinks towards something you enjoy."],
  [8, "Order alcohol-free out", "Next time you're out, order a non-alcoholic drink. Having a glass in hand helps."],
  [10, "Ride out an urge", "When you want a drink, wait 15 minutes and do something else. Notice how the urge fades."],
  [12, "Find your Friday ritual", "Replace the end-of-week drink with a new treat, like a bath, takeaway or long call."],
  [14, "Two weeks: check in", "How are your energy, mood and skin? Write down one change you've noticed."],
  [16, "Practise saying no", "Have a simple answer ready, such as \"I'm not drinking this month.\" You don't owe anyone more."],
  [18, "Move more", "Use your extra energy for a run, swim or long walk."],
  [20, "Spot your triggers", "Notice which times, people or feelings make you want a drink most."],
  [21, "Three weeks: look back", "Read your notes. What's been easier than you expected?"],
  [24, "Plan a sober social", "Arrange a meet-up that isn't built around drinking, like brunch, a gig or a hike."],
  [27, "Think about after", "Decide how you want to drink, or not, when the month ends."],
  [29, "Write your learnings", "Note three things you learned about yourself and alcohol this month."],
  [31, "You did a dry month", "Celebrate. If you decide to drink again, starting slowly is safest."],
]);

// ---------- Cannabis tolerance break (28 days) ----------

const T_BREAK = missions("tb", [
  [1, "Set your break goal", "Write down why you're taking a break and what you'd like to feel at the end."],
  [2, "Put it out of reach", "Give away or lock up your cannabis and gear, so it's not there when an urge hits."],
  [3, "Prepare for sleep changes", "Vivid dreams and restless nights are common early on. A regular bedtime helps."],
  [4, "Eat regular meals", "Appetite can dip for a few days. Small, regular meals keep your energy steady."],
  [5, "Move every day", "Exercise eases irritability and helps you sleep."],
  [7, "One week: check in", "Symptoms usually peak in the first week. Notice what's already easing."],
  [9, "Fill your evenings", "Plan something for the time you'd usually use, like a game, a call or cooking."],
  [11, "Name your feelings", "When you feel irritable or low, name the feeling. Naming it makes it easier to manage."],
  [14, "Halfway there", "Two weeks done. Spend some saved money on something that feels good."],
  [17, "Notice the clarity", "Write down one thing that feels clearer, like memory, focus or motivation."],
  [21, "Three weeks strong", "Most physical symptoms have usually passed by now. Keep going."],
  [24, "Decide what's next", "Think about how you want to use cannabis, if at all, after the break."],
  [26, "Plan a lower-risk return", "If you go back, use less, less often and lower strength. Your tolerance is lower now."],
  [28, "Break complete", "Four weeks is about how long brain cannabinoid receptors take to recover. Well done."],
]);

// ---------- Skill lessons (CBT / Community Reinforcement style, every 2 days) ----------

const SKILL_LESSONS = missions("sk", [
  [1, "Map your triggers", "Think of a recent time you used. Write what happened before, what you felt, and what you got out of it. Patterns show you where to plan."],
  [3, "Surf the urge", "Cravings rise, peak and fall like a wave, usually within minutes. Next time, notice where you feel it in your body and breathe until it passes."],
  [5, "Practise saying no", "Look the person in the eye, say no clearly, and suggest something else to do. Rehearse it out loud so it comes easily."],
  [7, "Spot small decisions", "Choices that seem unimportant, like a shortcut past a shop, can lead you towards using. Pick one and make a safer choice."],
  [9, "Solve one problem", "Name a problem that pulls you towards using. List three possible fixes, pick one and try it this week."],
  [11, "Talk back to thoughts", "Thoughts like \"just one won't hurt\" feel convincing. Write the thought down, then write a calmer, truer reply."],
  [13, "Add rewarding activities", "Recovery sticks when life without using feels good. Schedule one enjoyable, healthy activity for each day this week."],
  [15, "Build your relapse-prevention plan", "Write your warning signs, your top three coping steps and two people you'll call. Keep it somewhere you can find quickly."],
]);

export const PROGRAMS: ProgramDefinition[] = [
  {
    key: "QUIT_VAPING",
    name: "Quit vaping in 30 days",
    summary: "A week to prepare, a quit day, then three weeks of support to stay vape-free.",
    appliesTo: ["VAPE"],
    lengthDays: 30,
    missions: QUIT_VAPING,
    evidence:
      "Our own content, inspired by the phase-based approach (prepare, quit, stay quit) of text-message quit-vaping programs, which improved quit rates in a randomized trial with young adults (Graham AL et al., JAMA Intern Med 2021;181(7):923-30). Not affiliated with Truth Initiative.",
  },
  {
    key: "DAILY_MISSIONS",
    name: "30 daily missions",
    summary: "One small, doable mission a day for your first month nicotine-free.",
    appliesTo: NICOTINE_PRODUCTS,
    lengthDays: 30,
    missions: DAILY_MISSIONS,
    evidence:
      "Daily missions in the style of the Smoke Free app, whose daily missions were linked to higher quit rates in an exploratory randomized trial (Crane D et al., F1000Research 2018;7:1524).",
  },
  {
    key: "DRY_MONTH",
    name: "Dry month",
    summary: "31 days alcohol-free, with a mission most days to keep you going.",
    appliesTo: ["ALCOHOL"],
    lengthDays: 31,
    missions: DRY_MONTH,
    evidence:
      "Taking part in a month off alcohol was followed by less drinking six months later (de Visser RO, Robinson E, Bond R, Health Psychol 2016;35(3):281-9).",
  },
  {
    key: "T_BREAK",
    name: "Tolerance break",
    summary: "Four weeks off cannabis, long enough for your brain's receptors to reset.",
    appliesTo: ["CANNABIS"],
    lengthDays: 28,
    missions: T_BREAK,
    evidence:
      "Brain CB1 cannabinoid receptors, reduced in daily users, recovered to normal levels after about four weeks of abstinence (Hirvonen J et al., Mol Psychiatry 2012;17:642-9).",
  },
  {
    key: "SKILL_LESSONS",
    name: "Recovery skills",
    summary: "Eight short lessons in proven coping skills, one every two days.",
    appliesTo: ALL_PRODUCTS,
    lengthDays: 16,
    missions: SKILL_LESSONS,
    evidence:
      "Based on cognitive behavioural therapy and the Community Reinforcement Approach, both effective for substance use (Magill M, Ray LA, J Stud Alcohol Drugs 2009; Meyers RJ, Roozen HG, Smith JE, Alcohol Res Health 2011).",
  },
];

export function programDefinition(key: ProgramKey): ProgramDefinition {
  const def = PROGRAMS.find((p) => p.key === key);
  if (!def) throw new Error(`Unknown program ${key}`);
  return def;
}

export function availablePrograms(product: ProductType): ProgramDefinition[] {
  return PROGRAMS.filter((p) => p.appliesTo.includes(product));
}

/** Day (1-based, by local calendar day, capped at the program length), progress and due missions. */
export function programStatus(enrollment: ProgramEnrollment, now: number): ProgramStatus {
  const definition = programDefinition(enrollment.program);
  const until = enrollment.endedAt ? Math.min(now, Date.parse(enrollment.endedAt)) : now;
  const elapsed = daysBetweenDateKeys(toDateKey(enrollment.startedAt), localDateKey(until)) + 1;
  const day = Math.min(definition.lengthDays, Math.max(1, elapsed));
  const done = new Set(enrollment.completedMissions);
  const completed = definition.missions.filter((m) => done.has(m.key)).length;
  return {
    enrollmentId: enrollment.id,
    definition,
    day,
    completed,
    total: definition.missions.length,
    due: definition.missions.filter((m) => m.day <= day && !done.has(m.key)),
    finished: completed === definition.missions.length,
  };
}
