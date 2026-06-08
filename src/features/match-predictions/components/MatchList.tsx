import { useEffect } from 'react'
import type { MatchWithTeams, ScorePrediction } from '../types'
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

function isTodayDate(utcDate: string): boolean {
  const today = new Date()
  const matchDate = new Date(utcDate)
  return (
    matchDate.getFullYear() === today.getFullYear() &&
    matchDate.getMonth() === today.getMonth() &&
    matchDate.getDate() === today.getDate()
  )
}

export function MatchList({ matches, predictions, onMatchSelect }: Props) {
  const predictionMap = new Map(predictions.map((p) => [p.matchId, p]))
  const grouped = groupMatchesByDate(matches)

  const todayGroupIndex = grouped.findIndex(([, groupMatches]) =>
    groupMatches.some((m) => isTodayDate(m.utcDate)),
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
        return (
          <div key={dateLabel} id={isToday ? 'today' : undefined}>
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${isToday ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'}`}>
              {isToday ? `Today · ${dateLabel}` : dateLabel}
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
