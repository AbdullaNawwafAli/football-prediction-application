import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from '#/routeTree.gen'



import { getContext } from '#/lib/tanstack-query/query-client'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })


  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
