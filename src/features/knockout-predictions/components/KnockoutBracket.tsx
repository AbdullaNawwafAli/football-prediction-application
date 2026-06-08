import { Fragment } from 'react'
import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap } from '../types'
import { KNOCKOUT_STAGES, STAGE_LABELS } from '../types'
import { resolveTeams } from '../utils/resolveTeams'
import { BracketMatchCard } from './BracketMatchCard'
import { BracketConnector } from './BracketConnector'
import { MobileBracketStepper } from './MobileBracketStepper'

const BRACKET_HEIGHT = 1152
const MIN_COL_W = 120
const CONN_W = 24

type Props = {
  matchesByStage: Map<string, KnockoutMatchData[]>
  teamById: Map<number, KnockoutTeam>
  feederMap: Map<number, { home: number | null; away: number | null }>
  picks: KnockoutPicksMap
  onPick: (matchId: number, teamId: number) => void
  disabled: boolean
}

function MatchColumn({
  matches,
  teamById,
  feederMap,
  picks,
  onPick,
  disabled,
}: Omit<Props, 'matchesByStage'> & { matches: KnockoutMatchData[] }) {
  return (
    <div className="flex flex-col justify-around flex-1 min-w-0" style={{ height: BRACKET_HEIGHT }}>
      {matches.map((match) => {
        const { homeTeam, awayTeam } = resolveTeams(match, feederMap, teamById, picks)
        return (
          <BracketMatchCard
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
  )
}

export function KnockoutBracket({ matchesByStage, teamById, feederMap, picks, onPick, disabled }: Props) {
  const stages = KNOCKOUT_STAGES.filter((s) => matchesByStage.has(s))

  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground">
        Knockout matches are not available yet.
      </div>
    )
  }

  const minTotalW = stages.length * MIN_COL_W + (stages.length - 1) * CONN_W

  return (
    <>
      {/* ── Mobile: stage-by-stage stepper ── */}
      <div className="sm:hidden">
        <MobileBracketStepper
          stages={stages}
          matchesByStage={matchesByStage}
          teamById={teamById}
          feederMap={feederMap}
          picks={picks}
          onPick={onPick}
          disabled={disabled}
        />
      </div>

      {/* ── Desktop: full bracket ── */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border bg-card p-4">
        <div className="w-full" style={{ minWidth: minTotalW }}>
          <div className="flex mb-3">
            {stages.map((stage, i) => (
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
            {stages.map((stage, i) => (
              <Fragment key={stage}>
                {i > 0 && (
                  <BracketConnector
                    fromCount={matchesByStage.get(stages[i - 1])!.length}
                    toCount={matchesByStage.get(stage)!.length}
                  />
                )}
                <MatchColumn
                  matches={matchesByStage.get(stage)!}
                  teamById={teamById}
                  feederMap={feederMap}
                  picks={picks}
                  onPick={onPick}
                  disabled={disabled}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
