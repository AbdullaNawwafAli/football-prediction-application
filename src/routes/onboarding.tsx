import OnboardingForm from '#/features/onboarding/components/OnboardingForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
    component: OnboardingPage,
})

function OnboardingPage() {
    return (
        <div className="relative flex h-full items-center justify-center px-3 sm:px-4 overflow-hidden">

            <OnboardingForm />
        </div>
    )
}