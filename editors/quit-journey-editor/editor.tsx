import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedQuitJourneyDocument } from "document-models/quit-journey";
import { QuitJourneyApp } from "./QuitJourneyApp.js";
import { fontImport } from "./styles.js";

export default function Editor() {
  const [document, dispatch] = useSelectedQuitJourneyDocument();
  return (
    <>
      <style>{fontImport}</style>
      <QuitJourneyApp state={document.state.global} dispatch={dispatch} toolbar={<DocumentToolbar />} />
    </>
  );
}
