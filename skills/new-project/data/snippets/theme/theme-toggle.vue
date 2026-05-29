<script setup lang="ts">
import { useTheme } from '@/shared/theme/theme-provider'
import type { ThemeMode } from '@/shared/theme/types'

const theme = useTheme()

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="[
        'rounded-md px-2 py-1 text-sm transition-colors',
        theme.mode === opt.value
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted',
      ]"
      @click="theme.setMode(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
