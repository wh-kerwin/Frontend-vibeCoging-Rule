import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.1,
      warn: true,
    }),
  ],
  shortcuts: {
    'v-stack': 'flex flex-col',
    'h-stack': 'flex items-center',
    'surface-card': 'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
  theme: {
    // Mirror Tailwind's token colors so UnoCSS shortcuts can reference them.
    // Single source of truth for values lives in shared/styles/tokens.css.
    colors: {
      border: 'hsl(var(--border))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
    },
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
})

