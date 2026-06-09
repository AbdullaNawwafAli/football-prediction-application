import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/shadcn/ui/avatar'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/shadcn/ui/table'
import { cn } from '#/lib/shadcn/utils/utils'
import type { LeaderboardEntry } from '#/types/leaderboard'
import { UserHoverCard } from './UserHoverCard'

type Props = {
  entries: LeaderboardEntry[]
  currentUserId: string
  isPending: boolean
  mode: 'feature1' | 'feature2' | 'all'
  onUserClick?: (userId: string, displayName: string) => void
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-yellow-500/10 text-xs font-bold text-yellow-500">
        1
      </span>
    )
  if (rank === 2)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-400/10 text-xs font-bold text-slate-400">
        2
      </span>
    )
  if (rank === 3)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-600/10 text-xs font-bold text-amber-600">
        3
      </span>
    )
  return <span className="text-sm text-muted-foreground">{rank}</span>
}

export function LeaderboardTable({
  entries,
  currentUserId,
  isPending,
  mode,
  onUserClick,
}: Props) {
  if (isPending) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const stageColumns = [
    { key: 'matchday1', label: 'MD1',   value: (e: LeaderboardEntry) => e.matchday1 },
    { key: 'matchday2', label: 'MD2',   value: (e: LeaderboardEntry) => e.matchday2 },
    { key: 'matchday3', label: 'MD3',   value: (e: LeaderboardEntry) => e.matchday3 },
    { key: 'last32',    label: 'L32',   value: (e: LeaderboardEntry) => e.last32    },
    { key: 'last16',    label: 'L16',   value: (e: LeaderboardEntry) => e.last16    },
    { key: 'qf',        label: 'QF',    value: (e: LeaderboardEntry) => e.qf        },
    { key: 'sf',        label: 'SF',    value: (e: LeaderboardEntry) => e.sf        },
    { key: 'f3rd',      label: 'F/3rd', value: (e: LeaderboardEntry) => e.final + e.third },
  ]

  return (
    <div className={mode === 'feature2' ? 'overflow-x-auto' : undefined}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className={mode === 'feature2' ? 'min-w-28' : 'w-full'}>Player</TableHead>
            {mode === 'all' ? (
              <>
                <TableHead className="w-32 text-center">Stage</TableHead>
                <TableHead className="w-32 text-center">Matches</TableHead>
                <TableHead className="w-32 text-center">Overall</TableHead>
              </>
            ) : mode === 'feature2' ? (
              <>
                {stageColumns.map(({ key, label }) => (
                  <TableHead key={key} className="w-10 text-center text-xs px-1">{label}</TableHead>
                ))}
                <TableHead className="w-14 text-center font-semibold">Total</TableHead>
              </>
            ) : (
              <TableHead className="text-right whitespace-nowrap pr-4">Stage Pts</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId
            const initials = entry.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <TableRow
                key={entry.userId}
                className={cn(isCurrentUser && 'bg-muted/40')}
              >
                <TableCell className="text-center">
                  <RankBadge rank={entry.rank} />
                </TableCell>
                <TableCell className="max-w-0">
                  <UserHoverCard entry={entry}>
                    {onUserClick ? (
                      <button
                        type="button"
                        onClick={() => onUserClick(entry.userId, entry.displayName)}
                        className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
                      >
                        <Avatar size="sm" className="shrink-0">
                          <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className={cn('text-sm truncate', isCurrentUser && 'font-semibold')}>
                          {entry.displayName}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity">
                        <Avatar size="sm" className="shrink-0">
                          <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className={cn('text-sm truncate', isCurrentUser && 'font-semibold')}>
                          {entry.displayName}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                          )}
                        </span>
                      </span>
                    )}
                  </UserHoverCard>
                </TableCell>
                {mode === 'all' ? (
                  <>
                    <TableCell className="text-center font-mono font-medium tabular-nums">
                      {entry.feature1Points}
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium tabular-nums">
                      {entry.feature2Points}
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium tabular-nums">
                      {entry.totalPoints ?? 0}
                    </TableCell>
                  </>
                ) : mode === 'feature2' ? (
                  <>
                    {stageColumns.map(({ key, value }) => (
                      <TableCell key={key} className="text-center font-mono text-xs tabular-nums px-1">
                        {value(entry)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-mono font-semibold tabular-nums">
                      {entry.feature2Points}
                    </TableCell>
                  </>
                ) : (
                  <TableCell className="text-center font-mono font-medium tabular-nums">
                    {entry.feature1Points}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
