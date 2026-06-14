import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Serve from the in-memory cache for 60s before considering data stale.
        // Per-query staleTime overrides this where a different freshness is needed.
        staleTime: 60 * 1000,
        // Don't re-run queries (extra DB egress) just because the tab regained focus.
        refetchOnWindowFocus: false,
        // Likewise, don't refetch every query on network reconnect (flaky mobile/PWA).
        refetchOnReconnect: false,
      },
    },
  })
}

export function getQueryClient() {
  const queryClient = createQueryClient()

  return {
    queryClient,
  }
}
