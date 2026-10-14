import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // The Play Store package name is permanent once the first build is uploaded.
  appId: "com.w3b.quitjourney",
  appName: "Quit Journey",
  webDir: "dist",
  android: {
    // Release signing is configured in android/app/build.gradle from env vars (see mobile/README.md).
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
      style: "LIGHT",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_quit",
      iconColor: "#2F9E62",
    },
  },
};

export default config;
