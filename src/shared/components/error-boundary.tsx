import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/shared/logging/logger";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("react", "React render error", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="fatal-error">
        <AlertTriangle size={34} />
        <h1>OrderFlow could not render this page</h1>
        <p>{this.state.error.message}</p>
        <button className="button primary" onClick={() => window.location.reload()}>Reload application</button>
      </main>
    );
  }
}
