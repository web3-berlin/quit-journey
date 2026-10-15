import { Capacitor, registerPlugin } from "@capacitor/core";

export interface LaunchableApp {
  packageName: string;
  label: string;
}

/** The app's own Android plugin (android/app/src/main/java/com/w3b/quitjourney/QjNativePlugin.java). */
interface QjNativePlugin {
  hasUsageAccess(): Promise<{ granted: boolean }>;
  openUsageAccessSettings(): Promise<void>;
  screenTimeToday(options: { packages: string[] }): Promise<{ granted: boolean; minutes?: number }>;
  listLaunchableApps(): Promise<{ apps: LaunchableApp[] }>;
  composeSms(options: { phone: string; body: string }): Promise<void>;
  getDisguisedIcon(): Promise<{ on: boolean }>;
  setDisguisedIcon(options: { on: boolean }): Promise<{ on: boolean }>;
  setSecure(options: { on: boolean }): Promise<void>;
}

export const QjNative = registerPlugin<QjNativePlugin>("QjNative");

export const isAndroid = () => Capacitor.getPlatform() === "android";
