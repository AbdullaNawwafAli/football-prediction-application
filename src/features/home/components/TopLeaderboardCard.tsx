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
  type CarouselApi,
} from '#/components/shadcn/ui/carousel'
import { Button } from '#/components/shadcn/ui/button'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/shadcn/ui/tabs'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import createTopLeaderboardQueryOptions from '#/hooks/createTopLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import { transformedAvatarUrl } from '#/utils/avatarUrl'
import type { LeaderboardEntry } from '#/types/leaderboard'

type Player = {
  rank: number
  displayName: string
  avatarUrl: string
  favoriteTeamCrestUrl: string | null
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
    .sort((a, b) => {
      const diff = (b[key] ?? 0) - (a[key] ?? 0)
      return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName)
    })
    .slice(0, 3)
    .map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      favoriteTeamCrestUrl: e.favoriteTeamCrestUrl,
      points: e[key] ?? 0,
    }))
}

function getUserRank(
  entries: LeaderboardEntry[],
  key: 'feature1Points' | 'feature2Points' | 'totalPoints',
  userId: string,
): number | null {
  const idx = [...entries]
    .sort((a, b) => {
      const diff = (b[key] ?? 0) - (a[key] ?? 0)
      return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName)
    })
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
  const [api, setApi] = useState<CarouselApi>()

  return (
    <div className="flex flex-col gap-1 px-4 py-3 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
        {title}
      </p>
      <div className="flex items-center gap-0">
        <Button variant="outline" size="icon-sm" className="rounded-full shrink-0" onClick={() => api?.scrollPrev()}>
          <ChevronLeftIcon />
          <span className="sr-only">Previous</span>
        </Button>
        <Carousel opts={{ loop: true }} className="min-w-0 flex-1" setApi={setApi}>
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
                    <Avatar className="size-20">
                      <AvatarImage src={transformedAvatarUrl(player.avatarUrl)} alt={player.displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="font-semibold text-base text-center leading-tight line-clamp-1 capitalize">
                        {player.displayName}
                      </p>
                      {player.favoriteTeamCrestUrl && (
                        <img src={player.favoriteTeamCrestUrl} alt="" className="size-5 shrink-0 object-contain" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{player.points} pts</p>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
        <Button variant="outline" size="icon-sm" className="rounded-full shrink-0" onClick={() => api?.scrollNext()}>
          <ChevronRightIcon />
          <span className="sr-only">Next</span>
        </Button>
      </div>
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
  const { data: entries, isPending } = useQuery(createTopLeaderboardQueryOptions())
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
