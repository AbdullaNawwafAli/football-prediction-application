import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stage-prediction/my-knockout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stage-prediction/stage-prediction"!</div>
}
