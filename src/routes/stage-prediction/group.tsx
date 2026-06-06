import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stage-prediction/group')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stage-prediction/group-prediction"!</div>
}
