# Quit Journey for Android

The phone app around the shared Quit Journey UI (`editors/quit-journey-editor/QuitJourneyApp.tsx`).
It runs the real document-model reducer locally and stores each journey (one per addiction) in app-private storage, so it works fully offline with no account. Version 1.0 data (`quit-journey.json`) is migrated automatically into the journey index on first launch.

- **App ID:** `com.w3b.health.quitjourney` (Play package name, permanent once uploaded). The Java code package (`namespace`) stays `com.w3b.quitjourney`, which Android allows.
- **Stack:** Vite + React, Capacitor 8 (target SDK 36), local notifications, filesystem, share, geolocation, CapacitorHttp, plus the app's own plugin `QjNative` (`android/app/src/main/java/com/w3b/quitjourney/QjNativePlugin.java`).

## Native capabilities (`src/host.ts`)

`useHost()` implements the shared UI's `HostCapabilities` (`editors/quit-journey-editor/lib/host.ts`); `main.tsx` passes it and the document's `local` state to `QuitJourneyApp`.

| Capability | How |
|---|---|
| Safety alarms | Local notification on the `safety` channel (importance 5, vibration, `res/raw/safety_alarm.wav`), **exact** + allow-while-idle (needs the user-granted *Alarms & reminders* access, requested on the first check; falls back to inexact with an in-app warning). All other reminders are inexact. Ids 900000–999999 (hash of the check id); `syncNotifications` never cancels that range. |
| Message a contact | `QjNative.composeSms` → `ACTION_SENDTO smsto:` with the body prefilled. Never sends; no SMS permission. |
| Position | `@capacitor/geolocation`, foreground only (coarse/fine, no background location). |
| Screen time | `QjNative` reads `UsageStatsManager` events since midnight for the apps picked in *My plan → Screen time* (package list in `localStorage`); null without usage access. |
| Share / meeting feeds | `@capacitor/share`; `CapacitorHttp` (enabled in `capacitor.config.ts`) for code4recovery JSON feeds, https only. |
| Privacy | PIN (salted SHA-256 in `localStorage`, `src/privacy.ts`) gates the app on launch and after >1 min in the background (`LockScreen.tsx`); the disguised icon swaps the enabled launcher `activity-alias` (`.LauncherDefault` ↔ `.LauncherNotes`). |

Mobile-only settings (Privacy, Screen time, Meetings) live in `src/MobileSettings.tsx` and its section components.

Text follows the shared UI's language (see `editors/quit-journey-editor/i18n/README.md`; ids `mobile.*` and `notify.*`). Screens outside `QuitJourneyApp` (lock and boot screens) are wrapped in `MobileIntlProvider` in `main.tsx`; notifications, channel names and thrown errors use `formatMessage`/`tc` from `src/translate.ts`, which reads the same `qj-locale` choice.

## Everyday commands

```bash
cd mobile
npm run dev          # browser preview at http://localhost:5173 (notifications disabled)
npm run typecheck
npm run apk:debug    # → android/app/build/outputs/apk/debug/app-debug.apk
```

The Android toolchain lives in `~/Android` (JDK 21 + SDK). Export it first:

```bash
export JAVA_HOME=$HOME/Android/jdk ANDROID_HOME=$HOME/Android/Sdk PATH=$HOME/Android/jdk/bin:$HOME/Android/Sdk/platform-tools:$PATH
```

Install the debug build on your phone: enable *Developer options → USB debugging*, plug it in, then `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
Or copy the APK to the phone and open it (allow "install unknown apps").

After changing icon art in `assets/`, run `npm run assets` and commit the generated `android/app/src/main/res` files.

## One-time release setup

1. **Create the upload key** (keep the file and passwords in a password manager — losing them means a key-reset request to Google):

   ```bash
   keytool -genkeypair -keystore quit-journey-upload.jks -alias upload \
     -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Quit Journey"
   ```

2. **Add GitHub secrets** (repo → Settings → Secrets → Actions):

   | Secret | Value |
   |---|---|
   | `QJ_KEYSTORE_BASE64` | `base64 -w0 quit-journey-upload.jks` |
   | `QJ_KEYSTORE_PASSWORD` | keystore password |
   | `QJ_KEY_ALIAS` | `upload` |
   | `QJ_KEY_PASSWORD` | key password |
   | `PLAY_SERVICE_ACCOUNT_JSON` | *(optional)* service-account JSON with release access, for automatic uploads |

3. **Play Console:** create the app (name *Quit Journey*, free, app), and fill in *App content* with the answers in [`store/play-console.md`](store/play-console.md).
   The listing text is in [`store/listing.md`](store/listing.md); host [`store/privacy-policy.md`](store/privacy-policy.md) at a public URL (for example GitHub Pages) and paste that URL.

## Releasing

Run the **Android release** workflow (Actions → Android release → Run workflow) or push a tag:

```bash
git tag android-v1.0.0 && git push origin android-v1.0.0
```

It runs the type checks and tests, builds a signed `app-release.aab`, attaches it to the run, and — when `PLAY_SERVICE_ACCOUNT_JSON` is set — uploads it as a draft to the chosen track.
The very first upload must be done by hand in Play Console (*Testing → Internal testing → Create release*), because the API can only update an app that already has a build.

Local signed build, if you ever need one:

```bash
QJ_KEYSTORE_PATH=/path/to/quit-journey-upload.jks QJ_KEYSTORE_PASSWORD=… QJ_KEY_ALIAS=upload QJ_KEY_PASSWORD=… \
VERSION_CODE=2 VERSION_NAME=1.0.1 npm run aab:release
```

`VERSION_CODE` must increase with every upload.
