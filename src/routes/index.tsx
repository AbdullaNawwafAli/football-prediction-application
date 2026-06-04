import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Login })

function Login() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      Hello
    </main>
  )
}
