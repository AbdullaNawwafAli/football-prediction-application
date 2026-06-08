import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/shadcn/ui/card'
import type { UserScore } from '../services/getUserScore'

type Props = {
  displayName: string
  score: UserScore
}

type StatProps = {
  label: string
  value: number | null
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums">{value ?? 0}</span>
    </div>
  )
}

export function UserScoreCard({ displayName, score }: Props) {
  return (
    <Card size="sm" className="w-full">
      <CardHeader className="gap-0">
        <CardTitle>
          <span className="text-xl">{displayName}</span>
        </CardTitle>
        <CardDescription>Points you've earned so far</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 divide-x divide-border">
          <Stat label="Bracket" value={score.feature1Points} />
          <Stat label="Match" value={score.feature2Points} />
          <Stat label="Total" value={score.totalPoints} />
        </div>
      </CardContent>
    </Card>
  )
}
