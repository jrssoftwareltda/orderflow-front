import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { installGlobalErrorLogging, logger } from "@/shared/logging/logger";
import "./styles.css";

installGlobalErrorLogging();
logger.info("bootstrap", "OrderFlow frontend starting", {
  logLevel: logger.level,
  debugApi: logger.debugApi,
  debugUi: logger.debugUi,
  mode: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>,
);
