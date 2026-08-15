/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEV_API_PROXY?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_DEBUG_API?: string;
  readonly VITE_DEBUG_UI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
