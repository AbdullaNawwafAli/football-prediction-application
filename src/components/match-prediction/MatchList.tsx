import { useEffect } from 'react'
import type { MatchWithTeams, ScorePrediction } from '#/types/matches'
import { MatchCard } from './MatchCard'

type Props = {
  matches: MatchWithTeams[]
  predictions: ScorePrediction[]
  onMatchSelect: (matchId: number) => void
}

function groupMatchesByDate(matches: MatchWithTeams[]): [string, MatchWithTeams[]][] {
  const groups = new Map<string, MatchWithTeams[]>()
  for (const match of matches) {
    const dateKey = new Date(match.utcDate).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    if (!groups.has(dateKey)) groups.set(dateKey, [])
    groups.get(dateKey)!.push(match)
  }
  return Array.from(groups.entries())
}

function isSameDayAs(utcDate: string, ref: Date): boolean {
  const d = new Date(utcDate)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

export function MatchList({ matches, predictions, onMatchSelect }: Props) {
  const predictionMap = new Map(predictions.map((p) => [p.matchId, p]))
  const grouped = groupMatchesByDate(matches)

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const todayGroupIndex = grouped.findIndex(([, groupMatches]) =>
    groupMatches.some((m) => isSameDayAs(m.utcDate, today)),
  )
  const tomorrowGroupIndex = grouped.findIndex(([, groupMatches]) =>
    groupMatches.some((m) => isSameDayAs(m.utcDate, tomorrow)),
  )

  useEffect(() => {
    if (todayGroupIndex !== -1) {
      document.getElementById('today')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [todayGroupIndex])

  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No matches found.</p>
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden divide-y divide-border">
      {grouped.map(([dateLabel, groupMatches], idx) => {
        const isToday = idx === todayGroupIndex
        const isTomorrow = idx === tomorrowGroupIndex
        return (
          <div key={dateLabel} id={isToday ? 'today' : undefined}>
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${isToday ? 'bg-primary/10 text-primary' : isTomorrow ? 'bg-muted/60 text-foreground' : 'bg-muted/40 text-muted-foreground'}`}>
              {isToday ? `Today · ${dateLabel}` : isTomorrow ? `Tomorrow · ${dateLabel}` : dateLabel}
            </div>
            <div className="divide-y divide-border">
              {groupMatches.map((match) => (
                <MatchCard
                  key={match.matchId}
                  match={match}
                  prediction={predictionMap.get(match.matchId)}
                  onSelect={onMatchSelect}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
