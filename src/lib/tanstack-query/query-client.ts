import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient()
}

export function getContext() {
  const queryClient = createQueryClient()

  return {
    queryClient,
  }
}
