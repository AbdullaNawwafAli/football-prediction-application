import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { KnockoutPredictionsForm } from '#/features/knockout-predictions'

export const Route = createFileRoute('/bracket-prediction/my-knockout')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: MyKnockoutPage,
})

function MyKnockoutPage() {
  return (
    <>
      <Header>Knockout Predictions</Header>
      <KnockoutPredictionsForm />
    </>
  )
}
