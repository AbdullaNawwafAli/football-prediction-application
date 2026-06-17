import { useEffect, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { cn } from '#/lib/shadcn/utils/utils'
import { createLockStatusQueryOptions } from '../hooks/createLockStatusQueryOptions'
import { createFirstGroupMatchQueryOptions } from '../hooks/createFirstGroupMatchQueryOptions'

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

export function LockStatusBadge() {
  const { data: isOpen } = useSuspenseQuery(createLockStatusQueryOptions())
  const { data: firstMatchTime } = useSuspenseQuery(createFirstGroupMatchQueryOptions())
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
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
        Locked
      </span>
    )
  }

  const urgent = timeLeft !== null && timeLeft < 60 * 60 * 1000
  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full border tabular-nums',
        urgent
          ? 'bg-orange-50 text-orange-700 border-orange-300/50 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-700/50'
          : 'bg-green-50 text-green-700 border-green-300/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-700/50',
      )}
    >
      Open{timeLeft !== null ? ` · ${formatCountdown(timeLeft)}` : ''}
    </span>
  )
}
