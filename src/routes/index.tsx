import { Button } from '#/components/shadcn/ui/button'
import { supabase } from '#/lib/supabase/supabase'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile',
        redirectTo: `${window.location.origin}/home`,
      },
    })
  }

  return (
    <div className="page">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">World Cup 2026</h1>
        <p className="text-muted-foreground">Sign in to make your predictions</p>
        <Button onClick={handleLogin} size="lg">
          Sign in with Microsoft
        </Button>
      </div>
    </div>
  )
}
