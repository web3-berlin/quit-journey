import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  isQuitJourneyDocument,
  reducer,
  utils,
  type QuitJourneyAction,
  type QuitJourneyDocument,
} from "./core.js";

const FILE = "quit-journey.json";
const TMP = "quit-journey.tmp.json";

/** Loads the journey from app-private storage, or starts a fresh one. */
export async function loadDocument(): Promise<QuitJourneyDocument> {
  try {
    const { data } = await Filesystem.readFile({ path: FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
    const parsed: unknown = JSON.parse(typeof data === "string" ? data : await data.text());
    if (isQuitJourneyDocument(parsed)) return parsed;
  } catch {
    // No saved journey yet.
  }
  return utils.createDocument();
}

/** Writes to a temp file first, then renames, so a crash never leaves half a file. */
export async function saveDocument(doc: QuitJourneyDocument): Promise<void> {
  await Filesystem.writeFile({ path: TMP, data: JSON.stringify(doc), directory: Directory.Data, encoding: Encoding.UTF8, recursive: true });
  await Filesystem.rename({ from: TMP, to: FILE, directory: Directory.Data, toDirectory: Directory.Data });
}

/** Document state plus a dispatcher that runs actions through the real reducer and persists. */
export function useQuitDocument() {
  const [doc, setDoc] = useState<QuitJourneyDocument | null>(null);
  const saving = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef<QuitJourneyDocument | null>(null);
  latest.current = doc;

  useEffect(() => {
    void loadDocument().then(setDoc);
  }, []);

  useEffect(() => {
    if (!doc) return;
    const id = window.setTimeout(() => {
      saving.current = saving.current.then(() => saveDocument(doc)).catch((e: unknown) => console.error("Saving failed", e));
    }, 250);
    return () => window.clearTimeout(id);
  }, [doc]);

  const dispatch = useCallback((action: QuitJourneyAction) => {
    setDoc((current) => (current ? reducer(current, action) : current));
  }, []);

  const replace = useCallback((next: QuitJourneyDocument) => setDoc(next), []);

  /** Saves right away, e.g. when Android pauses the app. */
  const flush = useCallback(() => {
    const current = latest.current;
    if (!current) return saving.current;
    saving.current = saving.current.then(() => saveDocument(current)).catch((e: unknown) => console.error("Saving failed", e));
    return saving.current;
  }, []);

  return { doc, dispatch, replace, flush };
}
