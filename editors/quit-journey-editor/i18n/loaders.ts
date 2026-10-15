/* Generated list of lazy catalog loaders — one chunk per language. */
export type Messages = Record<string, string>;

const LOADERS: Partial<Record<string, () => Promise<{ default: Messages }>>> = {
  "zh-Hans": () => import("./messages/zh-Hans.js"),
  "hi": () => import("./messages/hi.js"),
  "es": () => import("./messages/es.js"),
  "fr": () => import("./messages/fr.js"),
  "bn": () => import("./messages/bn.js"),
  "pt": () => import("./messages/pt.js"),
  "ru": () => import("./messages/ru.js"),
  "de": () => import("./messages/de.js"),
  "ja": () => import("./messages/ja.js"),
  "pcm": () => import("./messages/pcm.js"),
  "mr": () => import("./messages/mr.js"),
  "te": () => import("./messages/te.js"),
  "tr": () => import("./messages/tr.js"),
  "ha": () => import("./messages/ha.js"),
  "ta": () => import("./messages/ta.js"),
  "sw": () => import("./messages/sw.js"),
  "vi": () => import("./messages/vi.js"),
  "fil": () => import("./messages/fil.js"),
  "pa": () => import("./messages/pa.js"),
  "ko": () => import("./messages/ko.js"),
  "jv": () => import("./messages/jv.js"),
  "it": () => import("./messages/it.js"),
  "gu": () => import("./messages/gu.js"),
  "th": () => import("./messages/th.js"),
  "am": () => import("./messages/am.js"),
  "kn": () => import("./messages/kn.js"),
  "yo": () => import("./messages/yo.js"),
  "pl": () => import("./messages/pl.js"),
  "ml": () => import("./messages/ml.js"),
  "uk": () => import("./messages/uk.js"),
  "su": () => import("./messages/su.js"),
  "ig": () => import("./messages/ig.js"),
  "uz": () => import("./messages/uz.js"),
  "ro": () => import("./messages/ro.js"),
  "nl": () => import("./messages/nl.js"),
  "az": () => import("./messages/az.js"),
  "ne": () => import("./messages/ne.js"),
  "zh-Hant": () => import("./messages/zh-Hant.js"),
  "zu": () => import("./messages/zu.js"),
  "yue": () => import("./messages/yue.js"),
};

/** English comes from each message's defaultMessage, so its catalog is empty. */
export async function loadMessages(code: string): Promise<Messages> {
  const load = LOADERS[code];
  return load ? (await load()).default : {};
}
