# Quit Journey for Android

The phone app around the shared Quit Journey UI (`editors/quit-journey-editor/QuitJourneyApp.tsx`).
It runs the real document-model reducer locally and stores the journey in app-private storage, so it works fully offline with no account.

- **App ID:** `com.w3b.quitjourney` — permanent after the first Play upload. Change it in `capacitor.config.ts` and `android/app/build.gradle` *before* that if you want another one.
- **Stack:** Vite + React, Capacitor 8 (target SDK 36), local notifications, filesystem, share.

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
