import { cn } from '#/lib/shadcn/utils/utils'
import type { MatchWithTeams, ScorePrediction } from '#/types/matches'

type Props = {
  match: MatchWithTeams
  prediction: ScorePrediction | undefined
  onSelect: (matchId: number) => void
}

function TeamSlot({ team }: { team: MatchWithTeams['homeTeam'] }) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />
        <span className="text-xs text-muted-foreground truncate">TBD</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team.crestUrl ? (
        <img src={team.crestUrl} alt={team.tla ?? team.name} className="h-6 w-6 shrink-0 object-contain" />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />
      )}
      <span className="text-sm font-medium truncate">{team.tla ?? team.name}</span>
    </div>
  )
}

function StatusBadge({
  status,
  fullTimeHome, fullTimeAway,
  halfTimeHome, halfTimeAway,
}: {
  status: string
  fullTimeHome: number | null
  fullTimeAway: number | null
  halfTimeHome: number | null
  halfTimeAway: number | null
}) {
  if (status === 'FINISHED' || status === 'AWARDED') {
    return (
      <span className="text-xs font-mono font-semibold tabular-nums text-foreground">
        {fullTimeHome ?? '–'} – {fullTimeAway ?? '–'}
      </span>
    )
  }
  if (status === 'IN_PLAY' || status === 'PAUSED' || status === 'EXTRA_TIME' || status === 'PENALTY_SHOOTOUT') {
    const scoreHome = fullTimeHome ?? halfTimeHome
    const scoreAway = fullTimeAway ?? halfTimeAway
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium text-green-500 animate-pulse">LIVE</span>
        {scoreHome !== null && (
          <span className="text-xs font-mono font-semibold tabular-nums text-foreground">
            {scoreHome} – {scoreAway}
          </span>
        )}
      </div>
    )
  }
  return null
}

function getPredictionResult(
  predictedHome: number, predictedAway: number,
  actualHome: number, actualAway: number,
): 'exact' | 'outcome' | 'wrong' {
  if (predictedHome === actualHome && predictedAway === actualAway) return 'exact'
  const predictedOutcome = Math.sign(predictedHome - predictedAway)
  const actualOutcome = Math.sign(actualHome - actualAway)
  return predictedOutcome === actualOutcome ? 'outcome' : 'wrong'
}

export function MatchCard({ match, prediction, onSelect }: Props) {
  const matchTime = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isFinished = match.status === 'FINISHED' || match.status === 'AWARDED'
  const isLive = ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(match.status)
  const teamsUnassigned = !match.homeTeam || !match.awayTeam
  const isPredictionLocked = Date.now() >= new Date(match.utcDate).getTime()

  const referenceHome = match.fullTimeHome ?? match.halfTimeHome
  const referenceAway = match.fullTimeAway ?? match.halfTimeAway

  const predictionResult =
    prediction && referenceHome !== null
      ? getPredictionResult(prediction.predictedHome, prediction.predictedAway, referenceHome, referenceAway!)
      : null

  const predictionBadgeClass =
    predictionResult === 'exact'
      ? 'text-green-600 bg-green-500/10'
      : predictionResult === 'outcome'
        ? 'text-amber-500 bg-amber-500/10'
        : predictionResult === 'wrong'
          ? 'text-red-500 bg-red-500/10'
          : 'text-primary bg-primary/10'

  return (
    <button
      type="button"
      onClick={() => onSelect(match.matchId)}
      disabled={teamsUnassigned || isPredictionLocked}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        !isPredictionLocked && 'hover:bg-muted/50 active:bg-muted',
        (isFinished || isPredictionLocked) && 'opacity-75',
        (teamsUnassigned || isPredictionLocked) && 'cursor-not-allowed',
      )}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <TeamSlot team={match.homeTeam} />
      </div>

      <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-[52px]">
        <StatusBadge
          status={match.status}
          fullTimeHome={match.fullTimeHome}
          fullTimeAway={match.fullTimeAway}
          halfTimeHome={match.halfTimeHome}
          halfTimeAway={match.halfTimeAway}
        />
        {!isFinished && !isLive && (
          <span className="text-xs text-muted-foreground">{matchTime}</span>
        )}
        {prediction && (
          <span className={cn('text-[10px] font-mono rounded px-1.5 py-0.5', predictionBadgeClass)}>
            {prediction.predictedHome}–{prediction.predictedAway}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
        <TeamSlot team={match.awayTeam} />
      </div>
    </button>
  )
}
