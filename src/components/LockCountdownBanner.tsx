import { useEffect, useState } from 'react'
import { Lock, Clock } from 'lucide-react'
import { cn } from '#/lib/shadcn/utils/utils'

interface Props {
  isOpen: boolean
  firstMatchTime: string | null
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function LockCountdownBanner({ isOpen, firstMatchTime }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!firstMatchTime || !isOpen) {
      setTimeLeft(null)
      return
    }

    const lockTime = new Date(firstMatchTime).getTime()

    const update = () => setTimeLeft(Math.max(0, lockTime - Date.now()))
    update()

    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [firstMatchTime, isOpen])

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <Lock className="h-4 w-4 shrink-0" />
        <span className="font-medium">Predictions are locked.</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-4 py-3 text-sm',
        timeLeft !== null && timeLeft < 60 * 60 * 1000
          ? 'border-orange-300/50 bg-orange-50 text-orange-700 dark:border-orange-700/50 dark:bg-orange-950/20 dark:text-orange-400'
          : 'border-green-300/50 bg-green-50 text-green-700 dark:border-green-700/50 dark:bg-green-950/20 dark:text-green-400',
      )}
    >
      <Clock className="h-4 w-4 shrink-0" />
      <span>
        <span className="font-medium">Predictions open.</span>
        {timeLeft !== null && (
          <> Locks in <span className="font-semibold tabular-nums">{formatCountdown(timeLeft)}</span>.</>
        )}
      </span>
    </div>
  )
}
