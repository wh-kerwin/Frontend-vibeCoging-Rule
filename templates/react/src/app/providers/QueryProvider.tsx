import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AppError } from '@/shared/http/errors'

// Global QueryClient – configure retry and stale-time defaults here.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only retry on network errors, not on 4xx responses.
      retry: (failureCount, error) => {
        if (error instanceof AppError && error.status && error.status < 500) return false
        return failureCount < 2
      },
      staleTime: 1000 * 60, // 1 minute
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
