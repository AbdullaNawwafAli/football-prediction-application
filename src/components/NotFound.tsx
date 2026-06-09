import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/shadcn/ui/button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <span className="text-7xl font-bold text-[#328f97]">404</span>
      <p className="text-muted-foreground">This page doesn't exist.</p>
      <Button onClick={() => navigate({ to: '/home' })}>Go home</Button>
    </div>
  )
}
