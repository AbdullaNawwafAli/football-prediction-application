import { cn } from '#/lib/shadcn/utils/utils'
import type { KnockoutTeam } from '../types'

type Props = {
  matchId: number
  homeTeam: KnockoutTeam | null
  awayTeam: KnockoutTeam | null
  pickedTeamId: number | undefined
  onPick: (matchId: number, teamId: number) => void
  disabled: boolean
}

function TeamButton({
  team,
  picked,
  disabled,
  onClick,
}: {
  team: KnockoutTeam | null
  picked: boolean
  disabled: boolean
  onClick: () => void
}) {
  const isTbd = team === null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isTbd}
      className={cn(
        'flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-colors',
        picked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-foreground',
        !disabled && !isTbd && 'hover:border-primary/50 hover:bg-primary/5',
        (disabled || isTbd) && 'cursor-default opacity-60',
      )}
    >
      {isTbd ? (
        <>
          <div className="h-8 w-8 rounded-full bg-muted" />
          <span className="text-xs font-medium text-muted-foreground">TBD</span>
        </>
      ) : (
        <>
          {team.crestUrl ? (
            <img src={team.crestUrl} alt={team.tla ?? team.name} className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          <span className="text-xs font-semibold leading-tight">
            {team.tla ?? team.name}
          </span>
        </>
      )}
    </button>
  )
}

export function MatchPickCard({ matchId, homeTeam, awayTeam, pickedTeamId, onPick, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      <TeamButton
        team={homeTeam}
        picked={pickedTeamId === homeTeam?.teamId}
        disabled={disabled}
        onClick={() => homeTeam && onPick(matchId, homeTeam.teamId)}
      />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">vs</span>
      <TeamButton
        team={awayTeam}
        picked={pickedTeamId === awayTeam?.teamId}
        disabled={disabled}
        onClick={() => awayTeam && onPick(matchId, awayTeam.teamId)}
      />
    </div>
  )
}
