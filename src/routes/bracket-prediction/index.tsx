import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Header } from '#/components/Header'
import { Button } from '#/components/shadcn/ui/button'
import { LeaderboardTable } from '#/components/LeaderboardTable'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import { GroupPredictionsSheet } from '#/features/group-predictions'
import { KnockoutPredictionsSheet, createKnockoutTeamsAssignedQueryOptions } from '#/features/knockout-predictions'

export const Route = createFileRoute('/bracket-prediction/')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: Feature1HomePage,
})

function Feature1HomePage() {
  const profile = useAuthStore((s) => s.profile)
  const currentUserId = profile?.id ?? ''

  const { data: entries, isPending } = useSuspenseQuery(
    createLeaderboardQueryOptions(),
  )
  const { data: knockoutTeamsAssigned } = useSuspenseQuery(createKnockoutTeamsAssignedQueryOptions())

  const [selectedUser, setSelectedUser] = useState<{ userId: string; displayName: string } | null>(null)
  const [groupSheetOpen, setGroupSheetOpen] = useState(false)
  const [activeSheet, setActiveSheet] = useState<'group' | 'knockout'>('group')
  const [ownKnockoutOpen, setOwnKnockoutOpen] = useState(false)

  function openGroupSheet(userId: string, displayName: string) {
    setSelectedUser({ userId, displayName })
    setActiveSheet('group')
    setGroupSheetOpen(true)
  }

  function closeGroupSheet() {
    setGroupSheetOpen(false)
    setTimeout(() => setSelectedUser(null), 300)
  }

  return (
    <div className="page">
      <Header>Bracket</Header>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => openGroupSheet(currentUserId, profile?.display_name ?? '')}
        >
          My Group <ArrowRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!knockoutTeamsAssigned}
          onClick={() => setOwnKnockoutOpen(true)}
        >
          My Knockout <ArrowRight className="size-3.5" />
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          isPending={isPending}
          mode="feature1"
          onUserClick={(userId, displayName) => openGroupSheet(userId, displayName)}
        />
      </div>

      {selectedUser && (
        <>
          <GroupPredictionsSheet
            userId={selectedUser.userId}
            displayName={selectedUser.displayName}
            open={groupSheetOpen}
            onOpenChange={(open) => { if (!open) closeGroupSheet() }}
            onViewKnockout={knockoutTeamsAssigned ? () => setActiveSheet('knockout') : undefined}
          />
          {knockoutTeamsAssigned && (
            <KnockoutPredictionsSheet
              userId={selectedUser.userId}
              displayName={selectedUser.displayName}
              open={activeSheet === 'knockout'}
              onOpenChange={(open) => { if (!open) setActiveSheet('group') }}
            />
          )}
        </>
      )}

      <KnockoutPredictionsSheet
        userId={currentUserId}
        displayName={profile?.display_name ?? ''}
        open={ownKnockoutOpen}
        onOpenChange={setOwnKnockoutOpen}
      />
    </div>
  )
}
