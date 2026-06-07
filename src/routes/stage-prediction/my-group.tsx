import { createFileRoute, redirect } from '@tanstack/react-router'
import { GroupPredictionsForm } from '#/features/group-predictions'

export const Route = createFileRoute('/stage-prediction/my-group')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: MyGroupPage,
})

function MyGroupPage() {
  return <GroupPredictionsForm />
}
