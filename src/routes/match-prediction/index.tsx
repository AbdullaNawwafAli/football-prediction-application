import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/match-prediction/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/match-prediction/"!</div>
}
