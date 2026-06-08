import OnboardingForm from '#/features/onboarding/components/OnboardingForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
    component: OnboardingPage,
})

function OnboardingPage() {
    return (
        <div className="page">
            <div className='flex w-full h-full items-center justify-center'>
            <OnboardingForm />
            </div>
        </div>
    )
}