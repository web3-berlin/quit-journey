/** A loud repeating two-tone alarm via Web Audio, for the safety timer while the app is open. */
export function startAlarm(): () => void {
  const Ctx = window.AudioContext;
  const ctx = new Ctx();
  let on = true;
  const beep = (freq: number, at: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.25;
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 0.35);
  };
  const loop = () => {
    if (!on) return;
    const t = ctx.currentTime;
    beep(880, t);
    beep(660, t + 0.45);
    window.setTimeout(loop, 1000);
  };
  loop();
  return () => {
    on = false;
    void ctx.close();
  };
}
