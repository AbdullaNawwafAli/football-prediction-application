import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/shadcn/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/shadcn/ui/dropdown-menu'
import { supabase } from '#/lib/supabase/supabase'
import { useAuthStore } from '#/stores/auth.store'
import type { ReactNode } from 'react'

type HeaderProps = {
  children: ReactNode
}

export function Header({ children }: HeaderProps) {
  const profile = useAuthStore((s) => s.profile)

  const initials =
    profile?.display_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? ''

  return (
    <header className="flex items-center gap-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar size="default">
              <AvatarImage
                src={profile?.avatar_url ?? ''}
                alt={profile?.display_name}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() => supabase.auth.signOut()}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="font-semibold text-base">{children}</span>
    </header>
  )
}
