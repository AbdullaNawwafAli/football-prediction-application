import { createRouter } from '@tanstack/react-router'
import { routeTree } from '#/routeTree.gen'
import { getContext } from '#/lib/tanstack-query/query-client'

export function createAppRouter() {
  const context = getContext()

  return createRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
