import { Fragment } from 'react'
import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap, KnockoutCorrectnessMap } from '../types'
import { KNOCKOUT_STAGES, STAGE_LABELS } from '../types'
import { resolveTeams } from '../utils/resolveTeams'
import { BracketMatchCard } from './BracketMatchCard'
import { BracketConnector } from './BracketConnector'
import { MobileBracketStepper } from './MobileBracketStepper'

const BRACKET_HEIGHT = 1152
const MIN_COL_W = 120
const CONN_W = 24

type FeederMap = Map<number, { home: number | null; away: number | null }>

type Props = {
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

type ColumnProps = Omit<Props, 'matchesByStage'> & {
  matches: KnockoutMatchData[]
  extraMatches?: KnockoutMatchData[]
  extraLabel?: string
}

function MatchColumn({
  matches,
  extraMatches,
  extraLabel,
  teamById,
  feederMap,
  loserFeederMap,
  matchById,
  picks,
  onPick,
  disabled,
  correctness,
}: ColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0" style={{ height: BRACKET_HEIGHT }}>
      <div className="flex flex-col justify-around flex-1">
        {matches.map((match) => {
          const { homeTeam, awayTeam } = resolveTeams(match, feederMap, loserFeederMap, teamById, picks, matchById)
          return (
            <BracketMatchCard
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

      {extraMatches && extraMatches.length > 0 && (
        <div className="flex flex-col gap-2 pb-4">
          {extraLabel && (
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {extraLabel}
            </span>
          )}
          {extraMatches.map((match) => {
            const { homeTeam, awayTeam } = resolveTeams(match, feederMap, loserFeederMap, teamById, picks, matchById)
            return (
              <BracketMatchCard
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
      )}
    </div>
  )
}

export function KnockoutBracket({
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
  // All stages in order, used for mobile stepper
  const allStages = KNOCKOUT_STAGES.filter((s) => matchesByStage.has(s))

  if (allStages.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground">
        Knockout matches are not available yet.
      </div>
    )
  }

  // Desktop: THIRD_PLACE is rendered inside the FINAL column, not as its own column
  const desktopStages = allStages.filter((s) => s !== 'THIRD_PLACE')
  const thirdPlaceMatches = matchesByStage.get('THIRD_PLACE') ?? []

  const minTotalW = desktopStages.length * MIN_COL_W + (desktopStages.length - 1) * CONN_W

  return (
    <>
      {/* ── Mobile: stage-by-stage stepper ── */}
      <div className="sm:hidden">
        <MobileBracketStepper
          stages={allStages}
          matchesByStage={matchesByStage}
          teamById={teamById}
          feederMap={feederMap}
          loserFeederMap={loserFeederMap}
          matchById={matchById}
          picks={picks}
          onPick={onPick}
          disabled={disabled}
          correctness={correctness}
        />
      </div>

      {/* ── Desktop: full bracket ── */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar rounded-lg border bg-card p-4">
        <div className="w-full" style={{ minWidth: minTotalW }}>
          <div className="flex mb-3">
            {desktopStages.map((stage, i) => (
              <Fragment key={stage}>
                {i > 0 && <div className="shrink-0" style={{ width: CONN_W }} />}
                <div className="flex-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {STAGE_LABELS[stage] ?? stage}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="flex items-stretch">
            {desktopStages.map((stage, i) => (
              <Fragment key={stage}>
                {i > 0 && (
                  <BracketConnector
                    fromCount={matchesByStage.get(desktopStages[i - 1])!.length}
                    toCount={matchesByStage.get(stage)!.length}
                  />
                )}
                <MatchColumn
                  matches={matchesByStage.get(stage)!}
                  extraMatches={stage === 'FINAL' ? thirdPlaceMatches : undefined}
                  extraLabel={stage === 'FINAL' && thirdPlaceMatches.length > 0 ? STAGE_LABELS['THIRD_PLACE'] : undefined}
                  teamById={teamById}
                  feederMap={feederMap}
                  loserFeederMap={loserFeederMap}
                  matchById={matchById}
                  picks={picks}
                  onPick={onPick}
                  disabled={disabled}
                  correctness={correctness}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
