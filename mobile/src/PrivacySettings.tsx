import { useState } from "react";
import { useIntl } from "react-intl";
import type { HostCapabilities } from "../../editors/quit-journey-editor/lib/host.js";
import { isAndroid } from "./native.js";
import { isValidPin, verifyPin } from "./privacy.js";

type Privacy = NonNullable<HostCapabilities["privacy"]>;
type Mode = "idle" | "set" | "remove";

/** PIN lock and disguised launcher icon. */
export function PrivacySettings({ privacy }: { privacy: Privacy }) {
  const intl = useIntl();
  const [mode, setMode] = useState<Mode>("idle");
  const [current, setCurrent] = useState("");
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [iconBusy, setIconBusy] = useState(false);

  function reset(next: Mode = "idle") {
    setMode(next);
    setCurrent("");
    setPin("");
    setAgain("");
  }

  async function save() {
    if (privacy.pinEnabled && !(await verifyPin(current))) return setMessage({ text: intl.formatMessage({ id: "mobile.privacy.currentWrong", defaultMessage: "Your current PIN isn't right." }), error: true });
    if (mode === "remove") {
      await privacy.setPin(null);
      reset();
      return setMessage({ text: intl.formatMessage({ id: "mobile.privacy.removed", defaultMessage: "PIN removed." }), error: false });
    }
    if (!isValidPin(pin)) return setMessage({ text: intl.formatMessage({ id: "mobile.privacy.useDigits", defaultMessage: "Use 4 to 8 digits." }), error: true });
    if (pin !== again) return setMessage({ text: intl.formatMessage({ id: "mobile.privacy.mismatch", defaultMessage: "The two PINs don't match." }), error: true });
    await privacy.setPin(pin);
    reset();
    setMessage({ text: intl.formatMessage({ id: "mobile.privacy.saved", defaultMessage: "PIN saved. The app asks for it on launch and after a minute away." }), error: false });
  }

  async function toggleIcon(on: boolean) {
    setIconBusy(true);
    try {
      await privacy.setDisguisedIcon(on);
      setMessage({ text: on
          ? intl.formatMessage({ id: "mobile.privacy.iconDisguised", defaultMessage: "When you leave the app, its home-screen icon changes to \"Notes\". Android closes the app once to apply it." })
          : intl.formatMessage({ id: "mobile.privacy.iconRestored", defaultMessage: "When you leave the app, the Quit Journey icon comes back." }), error: false });
    } catch {
      setMessage({ text: intl.formatMessage({ id: "mobile.privacy.iconFailed", defaultMessage: "Couldn't change the icon." }), error: true });
    } finally {
      setIconBusy(false);
    }
  }

  const digits = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value.replace(/\D/g, "").slice(0, 8));
  const pinInput = (label: string, value: string, set: (v: string) => void) => (
    <label className="field" style={{ maxWidth: 220 }}>
      <span>{label}</span>
      <input type="password" inputMode="numeric" autoComplete="off" value={value} onChange={digits(set)} />
    </label>
  );

  const turnOff = intl.formatMessage({ id: "mobile.privacy.turnOff", defaultMessage: "Turn PIN off" });

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "mobile.privacy.heading", defaultMessage: "Privacy" })}</h3>
      <p className="soft">{intl.formatMessage({ id: "mobile.privacy.intro", defaultMessage: "Keep your journey to yourself on a shared or borrowed phone." })}</p>

      <p>{privacy.pinEnabled ? intl.formatMessage({ id: "mobile.privacy.pinOn", defaultMessage: "App PIN is on." }) : intl.formatMessage({ id: "mobile.privacy.pinOff", defaultMessage: "App PIN is off." })}</p>
      {mode === "idle" ? (
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => { setMessage(null); reset("set"); }}>{privacy.pinEnabled ? intl.formatMessage({ id: "mobile.privacy.change", defaultMessage: "Change PIN" }) : intl.formatMessage({ id: "mobile.privacy.set", defaultMessage: "Set a PIN" })}</button>
          {privacy.pinEnabled && <button type="button" className="btn ghost" onClick={() => { setMessage(null); reset("remove"); }}>{turnOff}</button>}
        </div>
      ) : (
        <form className="panel stack" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          {privacy.pinEnabled && pinInput(intl.formatMessage({ id: "mobile.privacy.currentPin", defaultMessage: "Current PIN" }), current, setCurrent)}
          {mode === "set" && (
            <>
              {pinInput(intl.formatMessage({ id: "mobile.privacy.newPin", defaultMessage: "New PIN (4–8 digits)" }), pin, setPin)}
              {pinInput(intl.formatMessage({ id: "mobile.privacy.newPinAgain", defaultMessage: "New PIN again" }), again, setAgain)}
            </>
          )}
          <div className="row">
            <button type="submit" className="btn">{mode === "remove" ? turnOff : intl.formatMessage({ id: "mobile.privacy.save", defaultMessage: "Save PIN" })}</button>
            <button type="button" className="btn ghost" onClick={() => reset()}>{intl.formatMessage({ id: "mobile.common.cancel", defaultMessage: "Cancel" })}</button>
          </div>
        </form>
      )}

      {isAndroid() && (
        <label className="row" style={{ cursor: "pointer" }}>
          <input type="checkbox" style={{ width: 22, height: 22 }} checked={privacy.disguisedIcon} disabled={iconBusy} onChange={(e) => void toggleIcon(e.target.checked)} />
          <span>{intl.formatMessage({ id: "mobile.privacy.disguise", defaultMessage: "Disguise the app icon as \"Notes\"" })}</span>
        </label>
      )}
      {message && <p className={message.error ? "error" : "soft"} role="status">{message.text}</p>}
    </section>
  );
}
