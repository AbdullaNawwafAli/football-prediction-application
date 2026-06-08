import { Avatar, AvatarFallback, AvatarImage } from '#/components/shadcn/ui/avatar'
import { Button } from '#/components/shadcn/ui/button'
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
import type { LeaderboardEntry } from '../types/leaderboard'
import { UserHoverCard } from './UserHoverCard'

type Props = {
  entries: LeaderboardEntry[]
  currentUserId: string
  isPending: boolean
  pointsKey?: 'feature1Points' | 'feature2Points'
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base font-bold text-yellow-500">1</span>
  if (rank === 2) return <span className="text-base font-bold text-slate-400">2</span>
  if (rank === 3) return <span className="text-base font-bold text-amber-600">3</span>
  return <span className="text-sm text-muted-foreground">{rank}</span>
}

export function LeaderboardTable({ entries, currentUserId, isPending, pointsKey = 'feature1Points' }: Props) {
  if (isPending) {
    return (
      <div className="space-y-2">
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
          <TableHead className="text-right">Points</TableHead>
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
              className={cn(
                isCurrentUser && 'bg-primary/5 font-medium',
              )}
            >
              <TableCell className="text-center">
                <RankBadge rank={entry.rank} />
              </TableCell>
              <TableCell className="max-w-0">
                <UserHoverCard entry={entry}>
                  <Button variant='ghost' className="flex w-full items-center gap-2.5 transition-opacity text-left min-w-0">
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
                  </Button>
                </UserHoverCard>
              </TableCell>
              <TableCell className="text-right font-mono font-medium tabular-nums">
                {entry[pointsKey]}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
