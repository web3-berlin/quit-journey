# Play Console answers (App content)

Answers that match how the app is actually built. Check each against the current form wording when you fill it in.

## Privacy policy
Paste the public URL of `privacy-policy.md`.

## Ads
**No**, the app does not contain ads.

## App access
**All functionality is available without special access** (no login).

## Content rating (IARC questionnaire)
- Category: *Reference, news or educational* is the closest fit if offered; otherwise *All other app types*.
- Violence, sexuality, language, gambling: **No**.
- Controlled substances, alcohol, tobacco, gambling: the app **references** them only to help users stop or cut down (recovery, harm-reduction safety information such as naloxone and overdose signs). It does not depict use, sell anything, link to suppliers or encourage use. Answer the reference questions **Yes** and describe them as recovery/educational where the form allows. There is no real-money gambling in the app.
- User interaction / sharing: **No** user-to-user communication, **no** location sharing. Users can share a backup file via the system share sheet; the app has no social features.

## Target audience
**18 and over** only. (Keeps the app outside the Families policy, which fits an addiction-recovery app.)

## Data safety
- Does the app collect or share any required user data types? **No.**
  All data stays on the device; the app has no server. Google's guidance treats data processed only on-device, and transfers the user starts themselves (the backup share sheet), as not "collected" or "shared".
- Encryption in transit: not applicable (nothing is transmitted).
- Data deletion: users delete everything by uninstalling or clearing storage (no account exists).

## Health apps declaration
Select the closest health category the form offers for **addiction recovery / habit cessation and wellness tracking** (for example *Health and fitness* / *Habit tracking*). The app:
- does **not** diagnose, treat or claim to cure any condition,
- does **not** connect to medical devices or Health Connect,
- shows educational timelines with cited public-health sources (WHO, CDC, NHS, NIAAA, NIDA, SAMHSA and named studies) and a disclaimer in *My plan → About*,
- shows harm-reduction safety information (overdose signs, naloxone, never use alone, medically supervised withdrawal) — be ready to point reviewers to it if they ask about drug references.

## Government apps / financial features / news
**No** to each.

## Permissions to be ready to explain
| Permission | Why |
|---|---|
| `POST_NOTIFICATIONS` | Optional milestone alerts and check-in reminders (asked only when the user turns them on). |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Keep scheduled reminders after a reboot. |
| `INTERNET` | Required by the app's web view runtime; the app sends no data. |

`SCHEDULE_EXACT_ALARM` is deliberately removed, so no exact-alarm declaration is needed.

## Release path
1. **Internal testing** — first AAB uploaded by hand; add yourself as tester and install from the Play link.
2. **Closed testing** — required for personal developer accounts created after 13 Nov 2023: at least 12 testers opted in for 14 consecutive days before you can apply for production access.
3. **Production** — staged rollout (for example 20% → 100%).
