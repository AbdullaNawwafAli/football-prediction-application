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
import { transformedAvatarUrl } from '#/utils/avatarUrl'
import { useAuthStore } from '#/stores/auth.store'
import { useAudioStore } from '#/stores/audio.store'
import { HelpSheet } from '#/components/HelpSheet'
import { EditProfileDialog } from '#/features/edit-profile'
import { CircleHelp, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

type HeaderProps = {
  children: ReactNode
}

export function Header({ children }: HeaderProps) {
  const profile = useAuthStore((s) => s.profile)
  const { isPlaying, toggle } = useAudioStore()
  const [helpOpen, setHelpOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

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
                src={transformedAvatarUrl(profile?.avatar_url)}
                alt={profile?.display_name}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => supabase.auth.signOut()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="font-semibold text-base flex-1">{children}</span>
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Help"
      >
        <CircleHelp className="size-4" />
      </button>
      <button
        type="button"
        onClick={toggle}
        className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={isPlaying ? 'Mute music' : 'Play music'}
      >
        {isPlaying ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      </button>
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </header>
  )
}
