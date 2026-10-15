import type { SafetyNote } from "document-models/quit-journey";

/**
 * Safety guidance for the chosen substance; critical notes are tinted ember.
 * `collapsed` folds each note to its title (one tap to read) for screens people see every day.
 */
export function SafetyNotes({ notes, collapsed = false }: { notes: SafetyNote[]; collapsed?: boolean }) {
  if (notes.length === 0) return null;
  return (
    <div className="stack">
      {notes.map((n) => {
        const className = n.level === "critical" ? "panel tint-ember stack" : "panel stack";
        const title = `${n.level === "critical" ? "⚠️ " : ""}${n.title}`;
        return collapsed ? (
          <details key={n.title} className={className}>
            <summary style={{ cursor: "pointer" }}><h3 style={{ display: "inline" }}>{title}</h3></summary>
            <p style={{ marginTop: 8 }}>{n.body}</p>
          </details>
        ) : (
          <div key={n.title} className={className} role={n.level === "critical" ? "alert" : undefined}>
            <h3>{title}</h3>
            <p>{n.body}</p>
          </div>
        );
      })}
    </div>
  );
}
