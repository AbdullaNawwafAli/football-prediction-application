import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '#/components/shadcn/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '#/components/shadcn/ui/carousel'
import type { CarouselApi } from '#/components/shadcn/ui/carousel'
import { cn } from '#/lib/shadcn/utils/utils'
import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap, KnockoutCorrectnessMap } from '../types'
import { STAGE_LABELS } from '../types'
import { resolveTeams } from '../utils/resolveTeams'
import { MobileMatchCard } from './MobileMatchCard'

type FeederMap = Map<number, { home: number | null; away: number | null }>

type Props = {
  stages: string[]
  matchesByStage: Map<string, KnockoutMatchData[]>
  teamById: Map<number, KnockoutTeam>
  feederMap: FeederMap
  loserFeederMap: FeederMap
  matchById: Map<number, KnockoutMatchData>
  picks: KnockoutPicksMap
  onPick: (matchId: number, teamId: number) => void
  disabled: boolean
  correctness?: KnockoutCorrectnessMap
}

export function MobileBracketStepper({
  stages,
  matchesByStage,
  teamById,
  feederMap,
  loserFeederMap,
  matchById,
  picks,
  onPick,
  disabled,
  correctness,
}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    api.on('select', () => setStageIndex(api.selectedScrollSnap()))
  }, [api])

  const currentStage = stages[stageIndex]
  const currentMatches = matchesByStage.get(currentStage) ?? []

  const pickableMatches = currentMatches.filter((m) => {
    const { homeTeam, awayTeam } = resolveTeams(m, feederMap, loserFeederMap, teamById, picks, matchById)
    return homeTeam !== null && awayTeam !== null
  })

  const pickedCount = pickableMatches.filter((m) => m.matchId in picks).length
  const allPicked = pickedCount === pickableMatches.length && pickableMatches.length > 0
  const remaining = pickableMatches.length - pickedCount

  const canGoPrev = stageIndex > 0
  const canGoNext = allPicked && stageIndex < stages.length - 1

  return (
    <div className="space-y-4">
      {/* Sticky nav + progress dots */}
      <div className="space-y-4">
        {/* Stage header — centred label with absolutely-positioned buttons */}
        <div className="relative flex items-center justify-center py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => api?.scrollPrev()}
            disabled={!canGoPrev}
            className="absolute left-0 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center px-20">
            <p className="text-sm font-semibold">{STAGE_LABELS[currentStage] ?? currentStage}</p>
            <p className="text-xs text-muted-foreground">
              {stageIndex + 1} of {stages.length}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => api?.scrollNext()}
            disabled={!canGoNext}
            className="absolute right-0 gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {stages.map((s, i) => {
            const stageMatches = matchesByStage.get(s) ?? []
            const stagePicked = stageMatches.filter((m) => m.matchId in picks).length
            const stageComplete = stagePicked === stageMatches.length && stageMatches.length > 0
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (i <= stageIndex || allPicked) api?.scrollTo(i)
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
      </div>

      {/* Carousel */}
      <Carousel setApi={setApi}>
        <CarouselContent>
          {stages.map((stage) => {
            const stageMatches = matchesByStage.get(stage) ?? []
            return (
              <CarouselItem key={stage}>
                <div className="max-h-[60vh] overflow-y-auto no-scrollbar space-y-3 pt-2">
                  {stageMatches.map((match) => {
                    const { homeTeam, awayTeam } = resolveTeams(match, feederMap, loserFeederMap, teamById, picks, matchById)
                    return (
                      <MobileMatchCard
                        key={match.matchId}
                        matchId={match.matchId}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        pickedTeamId={picks[match.matchId]}
                        onPick={onPick}
                        disabled={disabled}
                        isCorrect={correctness?.[match.matchId]}
                      />
                    )
                  })}
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

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
