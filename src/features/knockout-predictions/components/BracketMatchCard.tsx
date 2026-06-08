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

function TeamRow({
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
        'flex items-center gap-2 w-full px-2.5 py-2 text-left transition-colors',
        picked ? 'bg-primary/15 text-primary' : 'hover:bg-muted/50',
        (disabled || isTbd) && 'cursor-default',
      )}
    >
      {isTbd ? (
        <span className="text-[11px] text-muted-foreground">TBD</span>
      ) : (
        <>
          {team.crestUrl ? (
            <img
              src={team.crestUrl}
              alt={team.tla ?? team.name}
              className="h-4 w-4 shrink-0 object-contain"
            />
          ) : (
            <div className="h-4 w-4 shrink-0 rounded-full bg-muted" />
          )}
          <span className={cn('text-[11px] truncate leading-none', picked && 'font-semibold')}>
            {team.tla ?? team.name}
          </span>
          {picked && <span className="ml-auto text-[10px] opacity-70">✓</span>}
        </>
      )}
    </button>
  )
}

export function BracketMatchCard({ matchId, homeTeam, awayTeam, pickedTeamId, onPick, disabled }: Props) {
  return (
    <div className="rounded border bg-card overflow-hidden w-full">
      <TeamRow
        team={homeTeam}
        picked={pickedTeamId === homeTeam?.teamId}
        disabled={disabled}
        onClick={() => homeTeam && onPick(matchId, homeTeam.teamId)}
      />
      <div className="h-px bg-border" />
      <TeamRow
        team={awayTeam}
        picked={pickedTeamId === awayTeam?.teamId}
        disabled={disabled}
        onClick={() => awayTeam && onPick(matchId, awayTeam.teamId)}
      />
    </div>
  )
}
