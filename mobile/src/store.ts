import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  isQuitJourneyDocument,
  reducer,
  utils,
  type QuitJourneyAction,
  type QuitJourneyDocument,
} from "./core.js";

/** Single-journey file used by app version 1.0; migrated into the index on first launch. */
const LEGACY_FILE = "quit-journey.json";
const INDEX_FILE = "journeys.json";

interface JourneyIndex {
  ids: string[];
  activeId: string | null;
}

const fileFor = (id: string) => `journey-${id}.json`;

async function readJson(path: string): Promise<unknown> {
  const { data } = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
  return JSON.parse(typeof data === "string" ? data : await data.text());
}

/** Writes to a temp file first, then renames, so a crash never leaves half a file. */
async function writeJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.tmp`;
  await Filesystem.writeFile({ path: tmp, data: JSON.stringify(value), directory: Directory.Data, encoding: Encoding.UTF8, recursive: true });
  await Filesystem.rename({ from: tmp, to: path, directory: Directory.Data, toDirectory: Directory.Data });
}

async function readDoc(path: string): Promise<QuitJourneyDocument | null> {
  try {
    const parsed = await readJson(path);
    return isQuitJourneyDocument(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface LoadedJourneys {
  docs: QuitJourneyDocument[];
  activeId: string;
}

/** Loads every journey; migrates the 1.0 single-journey file; starts a fresh journey if there is none. */
export async function loadJourneys(): Promise<LoadedJourneys> {
  let index: JourneyIndex | null = null;
  try {
    const raw = (await readJson(INDEX_FILE)) as Partial<JourneyIndex>;
    if (Array.isArray(raw.ids)) index = { ids: raw.ids.filter((x): x is string => typeof x === "string"), activeId: raw.activeId ?? null };
  } catch {
    // No index yet.
  }

  const docs: QuitJourneyDocument[] = [];
  if (index) {
    for (const id of index.ids) {
      const doc = await readDoc(fileFor(id));
      if (doc) docs.push(doc);
    }
  } else {
    const legacy = await readDoc(LEGACY_FILE);
    if (legacy) docs.push(legacy);
  }
  if (docs.length === 0) docs.push(utils.createDocument());

  const activeId = docs.some((d) => d.header.id === index?.activeId) ? (index?.activeId as string) : docs[0].header.id;
  await saveJourneys(docs, activeId);
  return { docs, activeId };
}

export async function saveJourneys(docs: QuitJourneyDocument[], activeId: string): Promise<void> {
  for (const doc of docs) await writeJson(fileFor(doc.header.id), doc);
  await writeJson(INDEX_FILE, { ids: docs.map((d) => d.header.id), activeId } satisfies JourneyIndex);
}

async function deleteJourneyFile(id: string) {
  try {
    await Filesystem.deleteFile({ path: fileFor(id), directory: Directory.Data });
  } catch {
    // Already gone.
  }
}

/** All journeys plus a dispatcher bound to the active one; every change is persisted. */
export function useJourneys() {
  const [docs, setDocs] = useState<QuitJourneyDocument[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const saving = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef<{ docs: QuitJourneyDocument[]; activeId: string } | null>(null);
  if (docs && activeId) latest.current = { docs, activeId };

  useEffect(() => {
    void loadJourneys().then((loaded) => {
      setDocs(loaded.docs);
      setActiveId(loaded.activeId);
    });
  }, []);

  const flush = useCallback(() => {
    const current = latest.current;
    if (!current) return saving.current;
    saving.current = saving.current.then(() => saveJourneys(current.docs, current.activeId)).catch((e: unknown) => console.error("Saving failed", e));
    return saving.current;
  }, []);

  useEffect(() => {
    if (!docs || !activeId) return;
    const id = window.setTimeout(() => void flush(), 250);
    return () => window.clearTimeout(id);
  }, [docs, activeId, flush]);

  const dispatch = useCallback((action: QuitJourneyAction) => {
    setDocs((current) => current?.map((d) => (d.header.id === latest.current?.activeId ? reducer(d, action) : d)) ?? current);
  }, []);

  const startNew = useCallback(() => {
    const doc = utils.createDocument();
    setDocs((current) => [...(current ?? []), doc]);
    setActiveId(doc.header.id);
  }, []);

  /** Restoring a backup replaces the journey with the same id, or adds it as a new journey. */
  const restore = useCallback((doc: QuitJourneyDocument) => {
    setDocs((current) => {
      const list = current ?? [];
      return list.some((d) => d.header.id === doc.header.id) ? list.map((d) => (d.header.id === doc.header.id ? doc : d)) : [...list, doc];
    });
    setActiveId(doc.header.id);
  }, []);

  const remove = useCallback((id: string) => {
    const current = latest.current;
    if (!current) return;
    const rest = current.docs.filter((d) => d.header.id !== id);
    const next = rest.length ? rest : [utils.createDocument()];
    setDocs(next);
    if (current.activeId === id) setActiveId(next[0].header.id);
    void deleteJourneyFile(id);
  }, []);

  const active = docs?.find((d) => d.header.id === activeId) ?? null;
  return { docs, active, activeId, setActiveId, dispatch, startNew, restore, remove, flush };
}
