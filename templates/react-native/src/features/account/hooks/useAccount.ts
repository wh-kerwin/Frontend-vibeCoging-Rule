import { useQuery } from '@tanstack/react-query'
import { getAccount } from '../api/account.api'

export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: getAccount,
  })
}

