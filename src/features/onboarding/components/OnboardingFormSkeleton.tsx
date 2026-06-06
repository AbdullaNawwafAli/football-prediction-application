import { Skeleton } from "#/components/shadcn/ui/skeleton";

function OnboardingFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="size-16 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}
export default OnboardingFormSkeleton