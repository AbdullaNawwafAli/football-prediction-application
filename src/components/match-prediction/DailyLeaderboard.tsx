import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/shadcn/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/shadcn/ui/card'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import createDailyLeaderboardQueryOptions from '#/hooks/createDailyLeaderboardQueryOptions'
import type { DailyLeaderboardEntry } from '#/services/getDailyLeaderboard'

const RANK_COLOR: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

const RANK_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

function Podium({ entries }: { entries: DailyLeaderboardEntry[] }) {
  const first  = entries.find((e) => e.rank === 1)
  const second = entries.find((e) => e.rank === 2)
  const third  = entries.find((e) => e.rank === 3)

  function PlayerCol({ entry, size }: { entry: DailyLeaderboardEntry; size: 'lg' | 'sm' }) {
    const initials = entry.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xs font-bold ${RANK_COLOR[entry.rank] ?? ''}`}>
          {RANK_LABEL[entry.rank]}
        </span>
        <Avatar className={size === 'lg' ? 'size-14' : 'size-10'}>
          <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
          <AvatarFallback className={size === 'sm' ? 'text-xs' : undefined}>{initials}</AvatarFallback>
        </Avatar>
        <p className={`font-medium text-center leading-tight line-clamp-1 w-20 capitalize ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {entry.displayName}
        </p>
        <p className="text-xs text-muted-foreground">{entry.pointsToday} pts today</p>
      </div>
    )
  }

  return (
    <div className="flex items-end justify-center gap-4 py-3">
      {second && <PlayerCol entry={second} size="sm" />}
      {first  && <PlayerCol entry={first}  size="lg" />}
      {third  && <PlayerCol entry={third}  size="sm" />}
    </div>
  )
}

export function DailyLeaderboard() {
  const { data: entries, isPending } = useQuery(
    createDailyLeaderboardQueryOptions(new Date()),
  )

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Today's Leaders</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isPending ? (
          <div className="flex justify-center gap-6 py-4">
            <Skeleton className="h-20 w-16 rounded-xl" />
            <Skeleton className="h-24 w-16 rounded-xl" />
            <Skeleton className="h-20 w-16 rounded-xl" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">
            No scores yet — check back after matches finish.
          </p>
        ) : (
          <Podium entries={entries} />
        )}
      </CardContent>
    </Card>
  )
}
