import { Outlet, createRootRouteWithContext, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { supabase } from '#/lib/supabase/supabase'
import { useAuthStore } from '#/stores/auth.store'
import type { RouterContext } from '#/router'
import { Toaster } from '#/components/shadcn/ui/sonner'


export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { setSession, setProfile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Get the initial session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
      
          if (!profile) {
            // No profile yet — send to onboarding
            navigate({ to: '/onboarding' })
          } else {
            flushSync(() => setProfile(profile))
            navigate({ to: '/dashboard' })
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          navigate({ to: '/' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)] min-h-dvh">
      <Outlet />
      <Toaster />
      {import.meta.env.DEV ? (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      ) : null}
    </div>
  )
}
