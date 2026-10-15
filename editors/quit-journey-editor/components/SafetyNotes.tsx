import type { SafetyNote } from "document-models/quit-journey";
import { cid, useContent } from "../i18n/content.js";

/**
 * Safety guidance for the chosen substance; critical notes are tinted ember.
 * `collapsed` folds each note to its title (one tap to read) for screens people see every day.
 */
export function SafetyNotes({ notes, collapsed = false }: { notes: SafetyNote[]; collapsed?: boolean }) {
  const { tc } = useContent();
  if (notes.length === 0) return null;
  return (
    <div className="stack">
      {notes.map((n) => {
        const className = n.level === "critical" ? "panel tint-ember stack" : "panel stack";
        const title = `${n.level === "critical" ? "⚠️ " : ""}${tc(cid.safety(n.title, "title"), n.title)}`;
        const body = tc(cid.safety(n.title, "body"), n.body);
        return collapsed ? (
          <details key={n.title} className={className}>
            <summary style={{ cursor: "pointer" }}><h3 style={{ display: "inline" }}>{title}</h3></summary>
            <p style={{ marginTop: 8 }}>{body}</p>
          </details>
        ) : (
          <div key={n.title} className={className} role={n.level === "critical" ? "alert" : undefined}>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        );
      })}
    </div>
  );
}
