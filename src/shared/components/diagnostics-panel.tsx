import { useEffect, useState } from "react";
import { Bug, Copy, X } from "lucide-react";
import { logger, type LogEntry } from "@/shared/logging/logger";

export function DiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(() => logger.entries());

  useEffect(() => logger.subscribe((entry) => {
    setEntries((current) => [...current.slice(-199), entry]);
  }), []);

  if (!logger.debugUi) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
    logger.info("diagnostics", "Diagnostics copied to clipboard", { entries: entries.length });
  };

  return (
    <>
      <button className="diagnostics-trigger" onClick={() => setOpen(true)} title="Open diagnostics">
        <Bug size={16} /> Debug
      </button>
      {open && (
        <div className="diagnostics-backdrop" onClick={() => setOpen(false)}>
          <aside className="diagnostics-panel" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <strong>Frontend diagnostics</strong>
                <small>level={logger.level} · apiDebug={String(logger.debugApi)}</small>
              </div>
              <div className="diagnostics-actions">
                <button onClick={copy} title="Copy logs"><Copy size={16} /></button>
                <button onClick={() => setOpen(false)} title="Close"><X size={16} /></button>
              </div>
            </header>
            <div className="diagnostics-log-list">
              {entries.length === 0 && <p className="muted">No logs captured yet.</p>}
              {[...entries].reverse().map((entry) => (
                <article key={entry.id} className={`diagnostics-log ${entry.level}`}>
                  <div><b>{entry.level.toUpperCase()}</b> <span>{entry.scope}</span> <time>{entry.timestamp}</time></div>
                  <p>{entry.message}</p>
                  {entry.data !== undefined && <pre>{JSON.stringify(entry.data, null, 2)}</pre>}
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
