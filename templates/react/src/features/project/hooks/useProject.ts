import { useQuery } from '@tanstack/react-query'
import { getProject } from '../api/project.api'

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    // Disable query until we have a real id.
    enabled: Boolean(id),
  })
}
