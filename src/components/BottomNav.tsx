import { useRouterState, Link } from '@tanstack/react-router'
import { IconHome, IconTournament, IconChartBar, IconScoreboard } from '@tabler/icons-react'
import { Tabs, TabsList, TabsTrigger } from '#/components/shadcn/ui/tabs'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: IconHome },
  { to: '/bracket-prediction', label: 'Bracket', icon: IconTournament },
  { to: '/match-prediction', label: 'Match', icon: IconScoreboard },
  { to: '/leaderboard', label: 'Leaderboard', icon: IconChartBar },
] as const

export default function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const activeTab = NAV_ITEMS.find((item) => pathname.startsWith(item.to))?.to

  return (
    <Tabs value={activeTab} className="shrink-0 overflow-hidden border-b border-border">
      <TabsList className="grid h-16 w-full grid-cols-4 rounded-none bg-transparent p-0">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <TabsTrigger
            key={to}
            value={to}
            asChild
            className="flex h-full flex-col items-center justify-center gap-0.5 rounded-none text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:flex-row sm:gap-2"
          >
            <Link to={to}>
              <Icon className="size-5" />
              <span className="hidden text-xs sm:inline">{label}</span>
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}