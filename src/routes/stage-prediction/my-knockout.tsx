import { createFileRoute, redirect } from '@tanstack/react-router'
import { KnockoutPredictionsForm } from '#/features/knockout-predictions'

export const Route = createFileRoute('/stage-prediction/my-knockout')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: KnockoutPredictionsForm,
})
