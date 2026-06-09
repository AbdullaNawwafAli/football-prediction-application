import { Suspense, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LockStatusBadge } from './LockStatusBadge'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import { Button } from '#/components/shadcn/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
} from '#/components/shadcn/ui/sheet'
import { useAuthStore } from '#/stores/auth.store'
import { GroupPredictionsForm } from './GroupPredictionsForm'
import { GroupPredictionsReadOnly } from './GroupPredictionsReadOnly'

type Props = {
  userId: string
  displayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function LoadingSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          {Array.from({ length: 4 }).map((_t, j) => (
            <Skeleton key={j} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function GroupPredictionsSheet({ userId, displayName, open, onOpenChange }: Props) {
  const currentUserId = useAuthStore((s) => s.profile?.id)
  const isOwnProfile = userId === currentUserId

  const submitRef = useRef<(() => void) | null>(null) as React.RefObject<(() => void) | null>
  const [mutationState, setMutationState] = useState({ isPending: false, canSubmit: false })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-full !max-w-full p-0 flex flex-col gap-0"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Group Predictions</SheetTitle>

        <div className="flex items-center gap-2 px-3 py-4 border-b shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="size-4" />
          </button>
          <span className="font-semibold text-base flex-1">
            {isOwnProfile ? 'Group Predictions' : `${displayName}'s Predictions`}
          </span>
          <Suspense fallback={null}>
            <LockStatusBadge />
          </Suspense>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <Suspense fallback={<LoadingSkeleton />}>
            {isOwnProfile ? (
              <GroupPredictionsForm
                submitRef={submitRef}
                onMutationStateChange={setMutationState}
              />
            ) : (
              <GroupPredictionsReadOnly userId={userId} />
            )}
          </Suspense>
        </div>

        {isOwnProfile && (
          <SheetFooter className="border-t px-4 py-4 shrink-0">
            <Button
              className="w-full"
              onClick={() => submitRef.current?.()}
              disabled={!mutationState.canSubmit}
            >
              {mutationState.isPending ? 'Saving…' : 'Save Predictions'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
