import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '#/components/shadcn/ui/button'
import { cn } from '#/lib/shadcn/utils/utils'
import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap } from '../types'
import { STAGE_LABELS } from '../types'
import { resolveTeams } from '../utils/resolveTeams'
import { MobileMatchCard } from './MobileMatchCard'

type Props = {
  stages: string[]
  matchesByStage: Map<string, KnockoutMatchData[]>
  teamById: Map<number, KnockoutTeam>
  feederMap: Map<number, { home: number | null; away: number | null }>
  picks: KnockoutPicksMap
  onPick: (matchId: number, teamId: number) => void
  disabled: boolean
}

export function MobileBracketStepper({
  stages,
  matchesByStage,
  teamById,
  feederMap,
  picks,
  onPick,
  disabled,
}: Props) {
  const [stageIndex, setStageIndex] = useState(0)

  const currentStage = stages[stageIndex]
  const currentMatches = matchesByStage.get(currentStage) ?? []

  // A match is "pickable" when both teams are known (not TBD)
  const pickableMatches = currentMatches.filter((m) => {
    const { homeTeam, awayTeam } = resolveTeams(m, feederMap, teamById, picks)
    return homeTeam !== null && awayTeam !== null
  })

  const pickedCount = pickableMatches.filter((m) => picks[m.matchId] !== undefined).length
  const allPicked = pickedCount === pickableMatches.length && pickableMatches.length > 0
  const remaining = pickableMatches.length - pickedCount

  const canGoNext = allPicked && stageIndex < stages.length - 1
  const canGoPrev = stageIndex > 0

  return (
    <div className="space-y-4">
      {/* Stage header + navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStageIndex((i) => i - 1)}
          disabled={!canGoPrev}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="text-center">
          <p className="text-sm font-semibold">{STAGE_LABELS[currentStage] ?? currentStage}</p>
          <p className="text-xs text-muted-foreground">
            {stageIndex + 1} of {stages.length}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStageIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {stages.map((s, i) => {
          const stageMatches = matchesByStage.get(s) ?? []
          const stagePicked = stageMatches.filter((m) => picks[m.matchId] !== undefined).length
          const stageComplete = stagePicked === stageMatches.length && stageMatches.length > 0
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                // Allow navigating back freely; forward only if current stage is complete
                if (i <= stageIndex || allPicked) setStageIndex(i)
              }}
              className={cn(
                'h-2 rounded-full transition-all',
                i === stageIndex
                  ? 'w-5 bg-primary'
                  : stageComplete
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-muted',
              )}
              aria-label={STAGE_LABELS[s] ?? s}
            />
          )
        })}
      </div>

      {/* Match cards */}
      <div className="space-y-3">
        {currentMatches.map((match) => {
          const { homeTeam, awayTeam } = resolveTeams(match, feederMap, teamById, picks)
          return (
            <MobileMatchCard
              key={match.matchId}
              matchId={match.matchId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              pickedTeamId={picks[match.matchId]}
              onPick={onPick}
              disabled={disabled}
            />
          )
        })}
      </div>

      {/* Status */}
      {pickableMatches.length > 0 && !disabled && (
        <p className={cn('text-center text-xs', allPicked ? 'text-primary' : 'text-muted-foreground')}>
          {allPicked
            ? stageIndex < stages.length - 1
              ? 'All picked — tap Next to continue'
              : 'All picks complete'
            : `${remaining} pick${remaining !== 1 ? 's' : ''} remaining in this round`}
        </p>
      )}
    </div>
  )
}
