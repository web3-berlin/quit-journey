import { useState } from "react";
import type { HostCapabilities } from "../../editors/quit-journey-editor/lib/host.js";
import { isAndroid } from "./native.js";
import { isValidPin, verifyPin } from "./privacy.js";

type Privacy = NonNullable<HostCapabilities["privacy"]>;
type Mode = "idle" | "set" | "remove";

/** PIN lock and disguised launcher icon. */
export function PrivacySettings({ privacy }: { privacy: Privacy }) {
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
    if (privacy.pinEnabled && !(await verifyPin(current))) return setMessage({ text: "Your current PIN isn't right.", error: true });
    if (mode === "remove") {
      await privacy.setPin(null);
      reset();
      return setMessage({ text: "PIN removed.", error: false });
    }
    if (!isValidPin(pin)) return setMessage({ text: "Use 4 to 8 digits.", error: true });
    if (pin !== again) return setMessage({ text: "The two PINs don't match.", error: true });
    await privacy.setPin(pin);
    reset();
    setMessage({ text: "PIN saved. The app asks for it on launch and after a minute away.", error: false });
  }

  async function toggleIcon(on: boolean) {
    setIconBusy(true);
    try {
      await privacy.setDisguisedIcon(on);
      setMessage({ text: on ? "When you leave the app, its home-screen icon changes to \"Notes\". Android closes the app once to apply it." : "When you leave the app, the Quit Journey icon comes back.", error: false });
    } catch {
      setMessage({ text: "Couldn't change the icon.", error: true });
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

  return (
    <section className="stack">
      <h3>Privacy</h3>
      <p className="soft">Keep your journey to yourself on a shared or borrowed phone.</p>

      <p>{privacy.pinEnabled ? "App PIN is on." : "App PIN is off."}</p>
      {mode === "idle" ? (
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => { setMessage(null); reset("set"); }}>{privacy.pinEnabled ? "Change PIN" : "Set a PIN"}</button>
          {privacy.pinEnabled && <button type="button" className="btn ghost" onClick={() => { setMessage(null); reset("remove"); }}>Turn PIN off</button>}
        </div>
      ) : (
        <form className="panel stack" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          {privacy.pinEnabled && pinInput("Current PIN", current, setCurrent)}
          {mode === "set" && (
            <>
              {pinInput("New PIN (4–8 digits)", pin, setPin)}
              {pinInput("New PIN again", again, setAgain)}
            </>
          )}
          <div className="row">
            <button type="submit" className="btn">{mode === "remove" ? "Turn PIN off" : "Save PIN"}</button>
            <button type="button" className="btn ghost" onClick={() => reset()}>Cancel</button>
          </div>
        </form>
      )}

      {isAndroid() && (
        <label className="row" style={{ cursor: "pointer" }}>
          <input type="checkbox" style={{ width: 22, height: 22 }} checked={privacy.disguisedIcon} disabled={iconBusy} onChange={(e) => void toggleIcon(e.target.checked)} />
          <span>Disguise the app icon as "Notes"</span>
        </label>
      )}
      {message && <p className={message.error ? "error" : "soft"} role="status">{message.text}</p>}
    </section>
  );
}
