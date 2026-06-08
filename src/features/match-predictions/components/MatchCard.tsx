import { cn } from '#/lib/shadcn/utils/utils'
import type { MatchWithTeams, ScorePrediction } from '../types'

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

function StatusBadge({ status, fullTimeHome, fullTimeAway }: { status: string; fullTimeHome: number | null; fullTimeAway: number | null }) {
  if (status === 'FINISHED' || status === 'AWARDED') {
    return (
      <span className="text-xs font-mono font-semibold tabular-nums text-foreground">
        {fullTimeHome ?? '–'} – {fullTimeAway ?? '–'}
      </span>
    )
  }
  if (status === 'IN_PLAY' || status === 'PAUSED' || status === 'EXTRA_TIME' || status === 'PENALTY_SHOOTOUT') {
    return <span className="text-xs font-medium text-green-500 animate-pulse">LIVE</span>
  }
  return null
}

export function MatchCard({ match, prediction, onSelect }: Props) {
  const matchTime = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isFinished = match.status === 'FINISHED' || match.status === 'AWARDED'
  const isLive = ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(match.status)

  return (
    <button
      type="button"
      onClick={() => onSelect(match.matchId)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted',
        isFinished && 'opacity-75',
      )}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <TeamSlot team={match.homeTeam} />
      </div>

      <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-[52px]">
        <StatusBadge status={match.status} fullTimeHome={match.fullTimeHome} fullTimeAway={match.fullTimeAway} />
        {!isFinished && !isLive && (
          <span className="text-xs text-muted-foreground">{matchTime}</span>
        )}
        {prediction && (
          <span className="text-[10px] text-primary font-mono bg-primary/10 rounded px-1.5 py-0.5">
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
