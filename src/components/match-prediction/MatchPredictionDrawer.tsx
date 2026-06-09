import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '#/components/shadcn/ui/button'
import { Input } from '#/components/shadcn/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '#/components/shadcn/ui/drawer'
import { useAuthStore } from '#/stores/auth.store'
import { upsertScorePrediction } from '#/services/upsertScorePrediction'
import type { MatchWithTeams, ScorePrediction } from '#/types/matches'

type Props = {
  matchId: number | null
  matches: MatchWithTeams[]
  predictions: ScorePrediction[]
  onClose: () => void
}

export function MatchPredictionDrawer({ matchId, matches, predictions, onClose }: Props) {
  const profile = useAuthStore((s) => s.profile)
  const queryClient = useQueryClient()
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  const match = matches.find((m) => m.matchId === matchId) ?? null
  const existing = predictions.find((p) => p.matchId === matchId)

  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saving, setSaving] = useState(false)

  const homeRef = useRef<HTMLInputElement>(null)
  const awayRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (matchId !== null) {
      const timer = setTimeout(() => homeRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [matchId])

  useEffect(() => {
    if (existing) {
      setHomeScore(String(existing.predictedHome))
      setAwayScore(String(existing.predictedAway))
    } else {
      setHomeScore('')
      setAwayScore('')
    }
  }, [matchId, existing?.predictedHome, existing?.predictedAway])

  const isFinished = match
    ? match.status === 'FINISHED' || match.status === 'AWARDED'
    : false

  async function handleSubmit() {
    if (!profile || !match) return

    const home = parseInt(homeScore, 10)
    const away = parseInt(awayScore, 10)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      toast.error('Please enter valid scores (0 or more).')
      return
    }

    setSaving(true)
    try {
      await upsertScorePrediction(profile.id, match.matchId, home, away)
      await queryClient.invalidateQueries({ queryKey: ['score-predictions', profile.id] })
      toast.success('Prediction saved!')
      onClose()
    } catch {
      toast.error('Failed to save prediction. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={matchId !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="text-center">
          <DrawerTitle>
            {match ? `${match.homeTeam?.tla ?? match.homeTeam?.name ?? 'TBD'} vs ${match.awayTeam?.tla ?? match.awayTeam?.name ?? 'TBD'}` : 'Match Prediction'}
          </DrawerTitle>
          {match && (
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(match.utcDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </DrawerHeader>

        <div className="px-4 py-4 space-y-4">
          {isFinished && match && (
            <p className="text-xs text-center text-muted-foreground">
              Final score: {match.fullTimeHome ?? '–'} – {match.fullTimeAway ?? '–'}
            </p>
          )}

          <div className="flex items-center gap-3 justify-center">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                {match?.homeTeam?.crestUrl && (
                  <img src={match.homeTeam.crestUrl} alt="" className="h-5 w-5 object-contain" />
                )}
                <span className="text-sm font-medium">{match?.homeTeam?.tla ?? match?.homeTeam?.name ?? 'Home'}</span>
              </div>
              <Input
                ref={homeRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); awayRef.current?.focus() } }}
                className="w-20 text-center text-lg font-mono"
                disabled={saving || isOffline || isFinished}
                placeholder="0"
              />
            </div>

            <span className="text-xl font-bold text-muted-foreground pb-1">–</span>

            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                {match?.awayTeam?.crestUrl && (
                  <img src={match.awayTeam.crestUrl} alt="" className="h-5 w-5 object-contain" />
                )}
                <span className="text-sm font-medium">{match?.awayTeam?.tla ?? match?.awayTeam?.name ?? 'Away'}</span>
              </div>
              <Input
                ref={awayRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
                className="w-20 text-center text-lg font-mono"
                disabled={saving || isOffline || isFinished}
                placeholder="0"
              />
            </div>
          </div>

          {isOffline && (
            <p className="text-sm text-center text-muted-foreground">You are offline — saving is disabled.</p>
          )}
        </div>

        <DrawerFooter className="pt-2">
          {!isFinished && (
            <Button
              onClick={handleSubmit}
              disabled={saving || isOffline || homeScore === '' || awayScore === ''}
              className="w-full"
            >
              {saving ? 'Saving…' : existing ? 'Update Prediction' : 'Save Prediction'}
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
