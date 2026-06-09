import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/shadcn/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/shadcn/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/shadcn/ui/carousel'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/shadcn/ui/tabs'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import type { LeaderboardEntry } from '#/types/leaderboard'

type Player = {
  rank: number
  displayName: string
  avatarUrl: string
  points: number
}

const RANK_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }
const RANK_COLOR: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

function toPlayers(
  entries: LeaderboardEntry[],
  key: 'feature1Points' | 'feature2Points' | 'totalPoints',
): Player[] {
  return [...entries]
    .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
    .slice(0, 3)
    .map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      points: e[key] ?? 0,
    }))
}

function getUserRank(
  entries: LeaderboardEntry[],
  key: 'feature1Points' | 'feature2Points' | 'totalPoints',
  userId: string,
): number | null {
  const idx = [...entries]
    .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
    .findIndex((e) => e.userId === userId)
  return idx === -1 ? null : idx + 1
}

function CategoryColumn({
  title,
  players,
  userRank,
}: {
  title: string
  players: Player[]
  userRank?: number | null
}) {
  return (
    <div className="flex flex-col gap-1 px-2 py-3 min-w-0">
      
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
        {title}
      </p>
      <Carousel opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {players.map((player) => {
            const initials = player.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            return (
              <CarouselItem key={player.rank}>
                <div className="flex flex-col items-center gap-4 py-4">
                  <span className={`text-sm font-bold ${RANK_COLOR[player.rank] ?? ''}`}>
                    {RANK_LABEL[player.rank] ?? `#${player.rank}`}
                  </span>
                  <Avatar  className="size-20">
                    <AvatarImage src={player.avatarUrl} alt={player.displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-base text-center leading-tight line-clamp-1 w-full px-2">
                    {player.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">{player.points} pts</p>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
      {userRank != null && userRank > 3 && (
        <p className="text-xs text-muted-foreground text-center pb-1">
          You're in position {userRank}
        </p>
      )}
    </div>
  )
}

type Category = {
  title: string
  players: Player[]
  userRank: number | null | undefined
}

function MobileCategoryTabs({ categories }: { categories: Category[] }) {
  const [activeTab, setActiveTab] = useState(categories[0]?.title ?? '')
  return (
    <div className="sm:hidden px-3 pb-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          {categories.map((cat) => (
            <TabsTrigger key={cat.title} value={cat.title} className="flex-1">
              {cat.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((cat) => (
          <TabsContent key={cat.title} value={cat.title}>
            {activeTab === cat.title && (
              <CategoryColumn title={cat.title} players={cat.players} userRank={cat.userRank} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export function TopLeaderboardCard() {
  const { data: entries, isPending } = useQuery(createLeaderboardQueryOptions())
  const currentUserId = useAuthStore((s) => s.profile?.id)

  if (isPending || !entries) {
    return <Skeleton className="w-full flex-1 rounded-xl" style={{ minHeight: '180px' }} />
  }

  const categories = [
    {
      title: 'Bracket',
      players: toPlayers(entries, 'feature1Points'),
      userRank: currentUserId ? getUserRank(entries, 'feature1Points', currentUserId) : null,
    },
    {
      title: 'Match',
      players: toPlayers(entries, 'feature2Points'),
      userRank: currentUserId ? getUserRank(entries, 'feature2Points', currentUserId) : null,
    },
    {
      title: 'Overall',
      players: toPlayers(entries, 'totalPoints'),
      userRank: currentUserId ? getUserRank(entries, 'totalPoints', currentUserId) : null,
    },
  ]

  return (
    <Card className="w-full flex-1 flex flex-col">
      <CardHeader className="gap-0">
        <CardTitle>
          <span className="text-xl">Top of the Boards</span>
        </CardTitle>
        <CardDescription>Bragging rights by category</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        {/* Mobile: tab per category */}
        <MobileCategoryTabs categories={categories} />
        {/* Desktop: all three side by side */}
        <div className="hidden sm:grid grid-cols-3 divide-x divide-border h-full">
          {categories.map((cat) => (
            <CategoryColumn key={cat.title} title={cat.title} players={cat.players} userRank={cat.userRank} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
