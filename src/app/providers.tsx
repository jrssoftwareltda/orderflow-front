import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { logger } from "@/shared/logging/logger";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error("query", "Query failed", {
        queryKey: query.queryKey,
        error: error instanceof Error ? error.message : String(error),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logger.error("query", "Mutation failed", {
        mutationKey: mutation.options.mutationKey,
        error: error instanceof Error ? error.message : String(error),
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: (failureCount, error) => {
        const status = typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: number }).status)
          : 0;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
