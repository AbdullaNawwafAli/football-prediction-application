import { Outlet, createRootRouteWithContext, useNavigate, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { supabase } from '#/lib/supabase/supabase'
import { useAuthStore } from '#/stores/auth.store'
import { useAudioStore } from '#/stores/audio.store'
import type { RouterContext } from '#/router'
import { Toaster } from '#/components/shadcn/ui/sonner'
import getProfileApi from '#/services/getProfile'
import BottomNav from '#/components/BottomNav'
import { AudioPlayer } from '#/components/AudioPlayer'


export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { setSession, setProfile } = useAuthStore()
  const setPlaying = useAudioStore((s) => s.setPlaying)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showNav = pathname !== '/' && pathname !== '/onboarding'

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
          const currentPath = window.location.pathname
          const profileAlreadyLoaded = useAuthStore.getState().profile !== null
          // Skip token-refresh events fired while already in the app.
          // A fresh OAuth redirect lands on /home with no profile loaded yet — that must be processed.
          if (currentPath !== '/' && currentPath !== '/onboarding' && profileAlreadyLoaded) return

          const profile = await getProfileApi(session.user.id)
          if (!profile) {
            // No profile yet — send to onboarding
            navigate({ to: '/onboarding' })
          } else {
            flushSync(() => setProfile(profile))
            setPlaying(true)
            navigate({ to: '/home' })
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
    <div className="font-sans h-[100dvh] w-full selection:bg-[rgba(79,184,178,0.24)] flex flex-col ">

      <main className="flex-1 min-h-0 overflow-y-auto w-full">
        <Outlet />
      </main>
      {showNav && <BottomNav />}
      <Toaster position="top-center" />
      <AudioPlayer />
      {/* {
        import.meta.env.DEV ? (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ) : null
      } */}
    </div>


  )
}
