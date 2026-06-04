import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { registerSW } from 'virtual:pwa-register'
import { createAppRouter } from '#/router'
import { useAuthStore } from '#/stores/auth.store'

import '#/styles.css'

const router = createAppRouter()

registerSW({ immediate: true })

function App() {
  const { session, profile } = useAuthStore()

  return (
    <RouterProvider
      router={router}
      context={{ session, profile }}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={router.options.context.queryClient.queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)