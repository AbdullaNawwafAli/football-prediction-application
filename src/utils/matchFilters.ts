import type { MatchWithTeams } from '#/types/matches'

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getUpcomingMatches(matches: MatchWithTeams[]) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 60 * 60 * 1000)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)

  return matches.filter((m) => {
    const matchTime = new Date(m.utcDate)
    const isTodayOrTomorrow = isSameDay(matchTime, now) || isSameDay(matchTime, tomorrow)
    return isTodayOrTomorrow && matchTime >= cutoff
  })
}
