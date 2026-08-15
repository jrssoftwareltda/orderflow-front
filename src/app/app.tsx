import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/shared/components/app-shell";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <AppShell><AppRouter /></AppShell>
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}
