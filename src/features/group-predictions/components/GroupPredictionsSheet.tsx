import { Suspense } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetTitle,
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

  return (
   
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-full !max-w-full p-0 flex flex-col gap-0"
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
          <span className="font-semibold text-base">
            {isOwnProfile ? 'Group Predictions' : `${displayName}'s Predictions`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingSkeleton />}>
            {isOwnProfile ? (
              <GroupPredictionsForm />
            ) : (
              <GroupPredictionsReadOnly userId={userId} />
            )}
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  
  )
}
