import { createRouter } from '@tanstack/react-router'
import { routeTree } from '#/routeTree.gen'
import { getQueryClient } from '#/lib/tanstack-query/query-client'
import type { Session } from '@supabase/supabase-js'
import type { ProfileData as Profile } from '#/types/profile-data'

// Define the shape explicitly — this is what beforeLoad sees as context
export interface RouterContext {
  queryClient: ReturnType<typeof getQueryClient>
  session: Session | null
  profile: Profile | null
}


export function createAppRouter() {
  const queryClient = getQueryClient()

  return createRouter({
    routeTree,
    context: {
      queryClient,
      session: null,
      profile: null,
    },
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