import { useTheme } from '@/app/providers/ThemeProvider'
import type { ThemeMode } from '@/shared/theme/types'

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`rounded-md px-2 py-1 text-sm transition-colors ${
            mode === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
          onClick={() => setMode(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
