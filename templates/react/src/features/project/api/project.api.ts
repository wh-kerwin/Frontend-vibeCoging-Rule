import { http } from '@/shared/http/client'
import { projectSchema, type Project } from '../schemas/project.schema'

export async function getProject(id: string): Promise<Project> {
  const data = await http.get<unknown>(`/projects/${id}`)
  return projectSchema.parse(data)
}

