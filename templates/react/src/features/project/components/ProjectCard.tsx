import type { Project } from '../schemas/project.schema'

interface ProjectCardProps {
  project: Project
  onOpen: (id: string) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <article className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        </div>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => onOpen(project.id)}>
          Open
        </button>
      </div>
    </article>
  )
}

