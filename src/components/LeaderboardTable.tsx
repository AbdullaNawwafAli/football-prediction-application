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
    return <span className="text-base font-bold text-yellow-500">1</span>
  if (rank === 2)
    return <span className="text-base font-bold text-slate-400">2</span>
  if (rank === 3)
    return <span className="text-base font-bold text-amber-600">3</span>
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Player</TableHead>
          {mode === 'all' ? (
            <>
              <TableHead className="text-center">Stage</TableHead>
              <TableHead className="text-center">Matches</TableHead>
              <TableHead className="text-center">Total</TableHead>
            </>
          ) : (
            <TableHead className="text-center">
              {mode === 'feature1' ? 'Stage Pts' : 'Match Pts'}
            </TableHead>
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
              className={cn(isCurrentUser && 'bg-primary/5 font-medium')}
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
                          <span className="ml-1.5 text-xs text-primary font-normal">(you)</span>
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
                          <span className="ml-1.5 text-xs text-primary font-normal">(you)</span>
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
              ) : (
                <TableCell className="text-center font-mono font-medium tabular-nums">
                  {mode === 'feature1'
                    ? entry.feature1Points
                    : entry.feature2Points}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
