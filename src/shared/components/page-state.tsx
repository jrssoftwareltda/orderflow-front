import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";

export function PageLoading({ label = "Loading..." }: { label?: string }) {
  return <div className="page-state"><LoaderCircle className="spin" size={28} /><p>{label}</p></div>;
}

export function PageError({ title = "Could not load data", message, onRetry }: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="page-state error">
      <AlertTriangle size={30} />
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button className="button secondary" onClick={onRetry}><RefreshCw size={16} /> Retry</button>}
    </div>
  );
}
