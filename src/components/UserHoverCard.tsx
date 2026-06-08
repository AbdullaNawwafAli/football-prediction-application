import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#/components/shadcn/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/shadcn/ui/avatar'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import type { LeaderboardEntry } from '#/types/leaderboard'
import createUserProfileQueryOptions from '#/hooks/createUserProfileQueryOptions'

type Props = {
  entry: LeaderboardEntry
  children: React.ReactNode
}

export function UserHoverCard({ entry, children }: Props) {
  const [open, setOpen] = useState(false)

  const { data: profile, isLoading } = useQuery({
    ...createUserProfileQueryOptions(entry.userId),
    enabled: open,
  })

  const initials = entry.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72" side="bottom" align="start">
        <div className="flex gap-3">
          <Avatar size="lg" className="size-14 shrink-0">
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="font-semibold text-sm truncate">{entry.displayName}</p>
            {isLoading ? (
              <>
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </>
            ) : profile ? (
              <>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground">Supports</span>
                  {profile.favoriteTeamCrestUrl && (
                    <img
                      src={profile.favoriteTeamCrestUrl}
                      alt={profile.favoriteTeam}
                      className="size-4 object-contain"
                    />
                  )}
                  <span className="text-xs font-medium truncate">{profile.favoriteTeam}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
