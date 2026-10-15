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
- User interaction / sharing: **No** user-to-user communication, **no** location sharing (location is used on the device only). Users can share a backup file via the system share sheet; the app has no social features.

## Target audience
**18 and over** only. (Keeps the app outside the Families policy, which fits an addiction-recovery app.)

## Data safety
- Does the app collect or share any required user data types? **No.**
  All data stays on the device; the app has no server. Google's guidance treats data processed only on-device, and transfers the user starts themselves (the backup share sheet), as not "collected" or "shared".
  This still holds with the newer features:
  - **Location** (risky-places alerts) is read on the device while the app is open, compared with places the user saved, and never stored off the phone or sent anywhere.
  - **App usage / screen time** is read on the device for the apps the user picks and shown only to them.
  - **Meeting feeds**: the app downloads a public meeting list from an address the user types in. Nothing about the user is sent beyond the ordinary HTTP request (no identifiers, no query parameters added by the app). Favourites are stored on the device.
  - **SMS**: the app only opens the user's messaging app with a prefilled text; it never sends or reads messages.
  - **PIN**: stored on the device as a salted SHA-256 hash.
- Encryption in transit: the only network use (meeting feeds) is https-only. Answer according to the form: no user data is transmitted.
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
| `POST_NOTIFICATIONS` | Optional milestone alerts, check-in reminders and safety-check alarms (asked only when the user turns one on). |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Keep scheduled reminders and safety alarms after a reboot. |
| `ACCESS_NETWORK_STATE` | Added by the location library (Play services); no data is read or sent. |
| `INTERNET` | Required by the app's web view runtime, and used only to download a public meeting list (code4recovery feed) from an address the user enters. No user data is sent. |
| `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` | **While the app is in use only.** Risky-places alerts: the user saves places that trigger cravings (a bar, a dealer's street, a casino) and the app warns them when they open it near one. Requested the first time the user uses the feature; the app works fully without it. |
| `PACKAGE_USAGE_STATS` (usage access) | Screen-time progress for gaming and social-media journeys: total minutes today in the apps the user picks. The user grants it on Android's *Usage access* screen; nothing leaves the device. |

Notes for review:
- **Usage access** is a special app-access permission. Play may ask for a declaration or justification (*App content → Permissions declaration*, or a policy-review email). Use the text above: core feature for users trying to cut down compulsive gaming or social-media use; data is shown only to the user, on the device; the feature is optional and off until the user grants access. A short screen recording of *My plan → Screen time → Allow usage access → Choose apps* helps.
- **Location**: there is **no** `ACCESS_BACKGROUND_LOCATION`, so no background-location declaration is needed. If the form asks, answer "foreground only".
- **SMS / Call log**: none. The app never declares `SEND_SMS`/`READ_SMS`; it opens the user's messaging app with a prefilled text (`ACTION_SENDTO`), and the user taps send.
- **Not used**: no accessibility service, no `VpnService`, no `QUERY_ALL_PACKAGES` (the app picker uses a launcher-intent `<queries>` entry), no device admin, no overlay permission.
- `SCHEDULE_EXACT_ALARM` (user-granted *Alarms & reminders* access) is used **only** for the safety timer the user starts before using ("check on me"): if they don't confirm they're OK, the alarm must ring on the minute — in testing an inexact alarm was delivered minutes late, which defeats an overdose-prevention timer. All other reminders stay inexact. The app does **not** use the restricted `USE_EXACT_ALARM`; if the user declines, the timer falls back to an inexact alarm and the app says it may ring late.
- **Disguised icon**: an optional `activity-alias` labelled "Notes" with a neutral icon, which the user can switch on under *My plan → Privacy* (for people whose phone may be seen by others). If a reviewer asks, it does not impersonate any other app's name or branding; describe it as a privacy feature. Mention it in the listing's description so the behaviour isn't a surprise ("Privacy: optional PIN lock and a discreet home-screen icon").

## Release path
1. **Internal testing** — first AAB uploaded by hand; add yourself as tester and install from the Play link.
2. **Closed testing** — required for personal developer accounts created after 13 Nov 2023: at least 12 testers opted in for 14 consecutive days before you can apply for production access.
3. **Production** — staged rollout (for example 20% → 100%).
