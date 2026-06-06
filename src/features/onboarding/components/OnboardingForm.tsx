import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/shadcn/ui/card'
import { Suspense } from 'react'

import OnboardingFormSkeleton from './OnboardingFormSkeleton'
import OnboardingFormContent from './OnboardingFormContent'

const OnboardingForm = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<OnboardingFormSkeleton />}>
          <OnboardingFormContent />
        </Suspense>
      </CardContent>
    </Card>
  )
}

export default OnboardingForm
