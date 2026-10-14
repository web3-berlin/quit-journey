import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { isQuitJourneyDocument, type QuitJourneyDocument } from "./core.js";
import { isNative } from "./notifications.js";

/** Shares the full document (state and operation history) as a JSON backup file. */
export async function exportBackup(doc: QuitJourneyDocument) {
  const date = new Date().toISOString().slice(0, 10);
  const name = `quit-journey-${date}.json`;
  const json = JSON.stringify(doc);
  if (isNative()) {
    await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
    const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
    await Share.share({ title: "Quit Journey backup", files: [uri] });
    return;
  }
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export class InvalidBackupError extends Error {}

export async function readBackup(file: File): Promise<QuitJourneyDocument> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new InvalidBackupError("That file isn't a Quit Journey backup (it isn't valid JSON).");
  }
  if (!isQuitJourneyDocument(parsed)) {
    throw new InvalidBackupError("That file isn't a Quit Journey backup.");
  }
  return parsed;
}
