import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { GroupPredictionsForm } from '#/features/group-predictions'

export const Route = createFileRoute('/bracket-prediction/my-group')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: MyGroupPage,
})

function MyGroupPage() {
  return (
    <>
      <Header>Group Predictions</Header>
      <GroupPredictionsForm />
    </>
  )
}
