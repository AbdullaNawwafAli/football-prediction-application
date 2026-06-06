import { createFileRoute, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'
import { GroupPredictionForm } from '#/features/group-prediction'

export const Route = createFileRoute('/stage-prediction/group')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: GroupPredictionPage,
})

function GroupPredictionPage() {
  return (
    <Suspense fallback={<GroupPredictionSkeleton />}>
      <GroupPredictionForm />
    </Suspense>
  )
}

function GroupPredictionSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((__, i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden">
            <div className="border-b bg-muted/50 px-4 py-2">
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
            <div className="p-2 space-y-1">
              {Array.from({ length: 4 }).map((___, j) => (
                <div
                  key={j}
                  className="h-10 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
