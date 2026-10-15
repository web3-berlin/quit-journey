package com.w3b.quitjourney;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import android.view.WindowManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.json.JSONException;

/**
 * Small device-only helpers for Quit Journey: screen time (usage access), the SMS composer
 * and the disguised launcher icon. Nothing here sends data anywhere.
 */
@CapacitorPlugin(name = "QjNative")
public class QjNativePlugin extends Plugin {

    private static final String ALIAS_DEFAULT = ".LauncherDefault";
    private static final String ALIAS_NOTES = ".LauncherNotes";

    // ---- Screen time -------------------------------------------------------

    private boolean hasUsageAccess() {
        Context ctx = getContext();
        AppOpsManager ops = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
        int mode;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mode = ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.getPackageName());
        } else {
            mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.getPackageName());
        }
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    @PluginMethod
    public void hasUsageAccess(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", hasUsageAccess());
        call.resolve(ret);
    }

    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("Usage access settings are not available on this device", "UNAVAILABLE");
        }
    }

    /** Foreground minutes since local midnight for the given packages; granted=false without usage access. */
    @PluginMethod
    public void screenTimeToday(PluginCall call) {
        JSObject ret = new JSObject();
        if (!hasUsageAccess()) {
            ret.put("granted", false);
            call.resolve(ret);
            return;
        }
        Set<String> wanted = new HashSet<>();
        JSArray packages = call.getArray("packages", new JSArray());
        try {
            for (String p : packages.<String>toList()) wanted.add(p);
        } catch (JSONException e) {
            call.reject("packages must be a list of strings");
            return;
        }

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        long start = cal.getTimeInMillis();
        long now = System.currentTimeMillis();

        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        UsageEvents events = usm.queryEvents(start, now);
        UsageEvents.Event event = new UsageEvents.Event();
        // A package is in the foreground while at least one of its activities is resumed.
        // Activities hand over to each other (RESUMED B can arrive before STOPPED A), so track them per class.
        Map<String, Set<String>> resumed = new HashMap<>();
        Map<String, Long> since = new HashMap<>();
        long totalMs = 0;
        while (events.hasNextEvent()) {
            events.getNextEvent(event);
            String pkg = event.getPackageName();
            if (!wanted.contains(pkg)) continue;
            int type = event.getEventType();
            String cls = String.valueOf(event.getClassName());
            Set<String> active = resumed.get(pkg);
            if (active == null) {
                active = new HashSet<>();
                resumed.put(pkg, active);
            }
            if (type == UsageEvents.Event.ACTIVITY_RESUMED) {
                if (active.isEmpty()) since.put(pkg, event.getTimeStamp());
                active.add(cls);
            } else if (type == UsageEvents.Event.ACTIVITY_PAUSED || type == UsageEvents.Event.ACTIVITY_STOPPED) {
                if (active.remove(cls) && active.isEmpty()) {
                    Long from = since.remove(pkg);
                    if (from != null) totalMs += event.getTimeStamp() - from;
                }
            }
        }
        // Apps still in the foreground count up to now.
        for (Long from : since.values()) totalMs += now - from;

        ret.put("granted", true);
        ret.put("minutes", Math.round(totalMs / 60000.0));
        call.resolve(ret);
    }

    /** Launchable apps the user can pick from (visible via the <queries> launcher intent). */
    @PluginMethod
    public void listLaunchableApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        Intent main = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> infos = pm.queryIntentActivities(main, 0);
        Map<String, String> byPackage = new HashMap<>();
        String self = getContext().getPackageName();
        for (ResolveInfo info : infos) {
            String pkg = info.activityInfo.packageName;
            if (pkg.equals(self)) continue;
            byPackage.put(pkg, String.valueOf(info.loadLabel(pm)));
        }
        List<String> sorted = new ArrayList<>(byPackage.keySet());
        Collections.sort(sorted, (a, b) -> byPackage.get(a).compareToIgnoreCase(byPackage.get(b)));
        JSArray apps = new JSArray();
        for (String pkg : sorted) {
            JSObject app = new JSObject();
            app.put("packageName", pkg);
            app.put("label", byPackage.get(pkg));
            apps.put(app);
        }
        JSObject ret = new JSObject();
        ret.put("apps", apps);
        call.resolve(ret);
    }

    // ---- SMS composer ------------------------------------------------------

    /** Opens the messaging app prefilled; the user still has to tap send. */
    @PluginMethod
    public void composeSms(PluginCall call) {
        String phone = call.getString("phone", "");
        String body = call.getString("body", "");
        Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + Uri.encode(phone)));
        intent.putExtra("sms_body", body);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("No messaging app is installed", "UNAVAILABLE");
        }
    }

    // ---- Disguised launcher icon ------------------------------------------

    private ComponentName alias(String suffix) {
        // Component class names use the Java package, which may differ from the applicationId.
        return new ComponentName(getContext(), MainActivity.class.getPackage().getName() + suffix);
    }

    private boolean isEnabled(ComponentName component, boolean enabledByDefault) {
        int state = getContext().getPackageManager().getComponentEnabledSetting(component);
        if (state == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT) return enabledByDefault;
        return state == PackageManager.COMPONENT_ENABLED_STATE_ENABLED;
    }

    /** Hides the app from the recent-apps preview and blocks screenshots while a PIN is set. */
    @PluginMethod
    public void setSecure(PluginCall call) {
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            if (on) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
            call.resolve();
        });
    }

    /** Requested icon state not yet applied (null = nothing pending). */
    private Boolean pendingDisguise = null;

    @PluginMethod
    public void getDisguisedIcon(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("on", pendingDisguise != null ? pendingDisguise : isEnabled(alias(ALIAS_NOTES), false));
        call.resolve(ret);
    }

    /**
     * Switching the enabled launcher alias finishes the task that was started through the old
     * alias, which would close the app under the user's finger. So the switch is only recorded
     * here and applied when the app leaves the foreground (handleOnStop).
     */
    @PluginMethod
    public void setDisguisedIcon(PluginCall call) {
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        pendingDisguise = on;
        JSObject ret = new JSObject();
        ret.put("on", on);
        ret.put("pending", true);
        call.resolve(ret);
    }

    private void applyPendingDisguise() {
        if (pendingDisguise == null) return;
        boolean on = pendingDisguise;
        pendingDisguise = null;
        if (isEnabled(alias(ALIAS_NOTES), false) == on && isEnabled(alias(ALIAS_DEFAULT), true) != on) return;
        PackageManager pm = getContext().getPackageManager();
        ComponentName show = alias(on ? ALIAS_NOTES : ALIAS_DEFAULT);
        ComponentName hide = alias(on ? ALIAS_DEFAULT : ALIAS_NOTES);
        // Enable the new entry first so the app always has a launcher icon.
        pm.setComponentEnabledSetting(show, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
        pm.setComponentEnabledSetting(hide, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
    }

    @Override
    protected void handleOnStop() {
        super.handleOnStop();
        applyPendingDisguise();
    }
}
