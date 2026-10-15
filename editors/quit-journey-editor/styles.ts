/** Web fonts for hosts without bundled fonts (Connect). The mobile app bundles them via @fontsource. */
export const fontImport = `@import url("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap");`;

/** Styles scoped to the `.qj` editor root so nothing leaks into Connect. */
export const styles = `

.qj {
  --air: #e4f0f7;
  --air-deep: #c9dfec;
  --paper: #fbfdfe;
  --ink: #14372f;
  --ink-soft: #46645c;
  --ink-mute: #6f8781;
  --leaf: #2f9e62;
  --leaf-deep: #1f7a49;
  --leaf-pale: #d5efe0;
  --haze: #a3abb0;
  --amber: #f0b23e;
  --amber-pale: #fcefd2;
  --ember: #d9483b;
  --ember-pale: #fbe3df;
  --line: #cfdde4;
  --display: "Bricolage Grotesque", "Bricolage Grotesque Variable", "Avenir Next", system-ui, sans-serif;
  /* Latin display/body faces; other scripts fall through to the system's fonts for that script. */
  --body: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
  background: var(--air);
  color: var(--ink);
  font-family: var(--body);
  font-size: 16px;
  line-height: 1.5;
  min-height: 100%;
}
.qj *, .qj *::before, .qj *::after { box-sizing: border-box; }
.qj .qj-wrap { max-width: 760px; margin: 0 auto; padding: 0 16px 120px; }
.qj h2, .qj h3 { font-family: var(--display); color: var(--ink); margin: 0; line-height: 1.15; }
.qj h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.01em; }
.qj h3 { font-size: 1.15rem; font-weight: 600; }
.qj p { margin: 0; }
.qj .muted { color: var(--ink-mute); }
.qj .soft { color: var(--ink-soft); }
.qj .stack > * + * { margin-top: 12px; }
.qj .stack-lg > * + * { margin-top: 28px; }
.qj .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.qj .spread { display: flex; gap: 12px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
.qj :focus-visible { outline: 3px solid var(--leaf); outline-offset: 2px; border-radius: 6px; }

/* Hero: the sky that clears as you heal */
.qj .sky {
  position: relative; overflow: hidden; border-radius: 0 0 28px 28px;
  margin: 0 -16px 28px; padding: 36px 24px 30px;
  background: linear-gradient(180deg, #7fb8dc 0%, #b4d8ec 55%, var(--air) 100%);
  color: var(--ink);
}
.qj .sky .haze {
  position: absolute; inset: -20%; pointer-events: none;
  background:
    radial-gradient(40% 30% at 20% 30%, rgba(120,128,133,.85), transparent 70%),
    radial-gradient(45% 35% at 75% 25%, rgba(140,147,151,.8), transparent 70%),
    radial-gradient(50% 40% at 50% 70%, rgba(110,118,122,.75), transparent 70%);
  filter: blur(18px);
  transition: opacity 1.2s ease;
  animation: qj-drift 26s ease-in-out infinite alternate;
}
@keyframes qj-drift { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
.qj .sky > *:not(.haze) { position: relative; }
.qj .sky .greeting { font-size: 1rem; color: var(--ink-soft); }
.qj .clock { font-family: var(--display); font-weight: 800; line-height: .95; margin: 8px 0 6px; font-variant-numeric: tabular-nums; }
.qj .clock .big { font-size: clamp(3.4rem, 14vw, 6.2rem); letter-spacing: -0.03em; }
.qj .clock .unit { font-size: 1.1rem; font-weight: 600; margin: 0 14px 0 4px; color: var(--ink-soft); }
.qj .clock .small { font-size: clamp(1.6rem, 6vw, 2.4rem); }
.qj .sky .caption { font-size: 1.05rem; max-width: 52ch; }

/* Plain stat lines instead of tiles */
.qj .ledger { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px 24px; }
.qj .ledger dt { color: var(--ink-mute); font-size: .9rem; }
.qj .ledger dd { margin: 2px 0 0; font-family: var(--display); font-weight: 600; font-size: 1.55rem; font-variant-numeric: tabular-nums; }

.qj .panel { background: var(--paper); border-radius: 18px; padding: 20px; border: 1px solid var(--line); }
.qj .panel.tint-leaf { background: var(--leaf-pale); border-color: transparent; }
.qj .panel.tint-amber { background: var(--amber-pale); border-color: transparent; }
.qj .panel.tint-ember { background: var(--ember-pale); border-color: transparent; }

/* Tabs */
.qj .tabs { display: flex; gap: 4px; overflow-x: auto; padding: 4px; margin: 16px 0 0; background: var(--air-deep); border-radius: 999px; scrollbar-width: none; }
.qj .tabs button { flex: 1 0 auto; border: 0; background: transparent; color: var(--ink-soft); font: 600 .95rem var(--body); padding: 9px 14px; border-radius: 999px; cursor: pointer; white-space: nowrap; }
.qj .tabs button[aria-selected="true"] { background: var(--paper); color: var(--ink); box-shadow: 0 1px 2px rgba(20,55,47,.12); }

/* Controls */
.qj .btn { display: inline-flex; align-items: center; gap: 8px; border: 0; cursor: pointer; font: 700 1rem var(--body); padding: 11px 18px; border-radius: 12px; background: var(--leaf); color: #fff; }
.qj .btn:hover { background: var(--leaf-deep); }
.qj .btn:disabled { opacity: .45; cursor: not-allowed; }
.qj .btn.ghost { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--line); }
.qj .btn.ghost:hover { background: var(--air); }
.qj .btn.ember { background: var(--ember); }
.qj .btn.ember:hover { background: #b83a2f; }
.qj .btn.small { padding: 6px 12px; font-size: .9rem; border-radius: 10px; }
.qj .linkish { border: 0; background: none; color: var(--ink-mute); cursor: pointer; font: inherit; text-decoration: underline; padding: 0; }
.qj label.field { display: block; }
.qj label.field > span { display: block; font-size: .9rem; color: var(--ink-soft); margin-bottom: 4px; }
.qj input, .qj select, .qj textarea {
  width: 100%; font: 1rem var(--body); color: var(--ink); background: #fff;
  border: 1.5px solid var(--line); border-radius: 10px; padding: 9px 11px;
}
.qj textarea { min-height: 72px; resize: vertical; }
.qj .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.qj .chips { display: flex; flex-wrap: wrap; gap: 8px; }
.qj .chip { border: 1.5px solid var(--line); background: #fff; color: var(--ink); padding: 6px 12px; border-radius: 999px; cursor: pointer; font: .92rem var(--body); }
.qj .chip[aria-pressed="true"] { background: var(--ink); color: #fff; border-color: var(--ink); }
.qj .scale { display: flex; gap: 6px; }
.qj .scale button { flex: 1; min-width: 40px; padding: 10px 0; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; cursor: pointer; font: 700 1rem var(--display); color: var(--ink); }
.qj .scale button[aria-pressed="true"] { background: var(--leaf); color: #fff; border-color: var(--leaf); }
.qj .error { color: var(--ember); font-size: .92rem; }

/* Progress */
.qj .meter { height: 10px; border-radius: 999px; background: var(--air-deep); overflow: hidden; }
.qj .meter > i { display: block; height: 100%; border-radius: 999px; background: var(--leaf); transition: width .6s ease; }
.qj .meter.amber > i { background: var(--amber); }

/* Health timeline: a real sequence, so it gets a vertical path */
.qj .timeline { list-style: none; margin: 0; padding: 0; position: relative; }
.qj .timeline li { display: grid; grid-template-columns: 52px 1fr; gap: 14px; padding: 0 0 22px; position: relative; }
.qj .timeline li::before { content: ""; position: absolute; inset-inline-start: 25px; top: 52px; bottom: 0; width: 2px; background: var(--line); }
.qj .timeline li:last-child::before { display: none; }
.qj .timeline li.done::before { background: var(--leaf); }
.qj .timeline .when { font-size: .9rem; color: var(--ink-mute); }

/* Badges */
.qj .badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.qj .badge { padding: 14px; border-radius: 16px; background: var(--paper); border: 1px solid var(--line); text-align: start; }
.qj .badge .icon { font-size: 1.9rem; line-height: 1; }
.qj .badge.locked .icon { filter: grayscale(1); opacity: .45; }
.qj .badge.earned { background: var(--amber-pale); border-color: transparent; }
.qj .badge .name { font: 600 1rem var(--display); margin-top: 8px; }

/* Lists */
.qj .list { list-style: none; margin: 0; padding: 0; }
.qj .list li { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); align-items: flex-start; }
.qj .list li:last-child { border-bottom: 0; }

/* Charts */
.qj .heat { display: grid; grid-template-columns: 34px repeat(24, 1fr); gap: 2px; font-size: .7rem; color: var(--ink-mute); }
.qj .heat .cell { aspect-ratio: 1; border-radius: 3px; }
.qj .bars { display: flex; align-items: flex-end; gap: 6px; height: 120px; border-bottom: 1px solid var(--line); }
.qj .bars > div { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
.qj .bars > div > i { display: block; background: var(--leaf); border-radius: 4px 4px 0 0; min-height: 2px; }
.qj .bars > div:hover > i { background: var(--leaf-deep); }
.qj .hbar { display: grid; grid-template-columns: minmax(110px, 38%) 1fr 48px; gap: 10px; align-items: center; }
.qj .hbar .track { height: 12px; background: var(--air-deep); border-start-end-radius: 4px; border-end-end-radius: 4px; }
.qj .hbar .track > i { display: block; height: 100%; background: var(--leaf); border-start-end-radius: 4px; border-end-end-radius: 4px; }

/* SOS */
.qj .sos-fab { position: fixed; inset-inline-end: 20px; bottom: 24px; z-index: 40; width: 76px; height: 76px; border-radius: 50%; border: 0; cursor: pointer; background: var(--ember); color: #fff; font: 800 1.1rem var(--display); box-shadow: 0 8px 24px rgba(217,72,59,.35); }
.qj .sos-fab:hover { background: #b83a2f; }
.qj .sos { position: fixed; inset: 0; z-index: 50; background: rgba(20,55,47,.55); display: flex; align-items: flex-end; justify-content: center; }
.qj .sos .sheet { width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; background: var(--paper); border-radius: 26px 26px 0 0; padding: 24px 20px 32px; }
@media (min-width: 640px) { .qj .sos { align-items: center; } .qj .sos .sheet { border-radius: 26px; } }
.qj .breath-stage { height: 260px; display: grid; place-items: center; }
.qj .breath { width: 170px; height: 170px; border-radius: 50%; display: grid; place-items: center; text-align: center; background: radial-gradient(circle, var(--leaf-pale) 0%, #bfe6d0 100%); transition: transform 1s linear; font: 700 1.2rem var(--display); }

@media (prefers-reduced-motion: reduce) {
  .qj .sky .haze { animation: none; }
  .qj .breath, .qj .meter > i { transition: none; }
}
`;
