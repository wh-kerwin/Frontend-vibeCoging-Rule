<script setup lang="ts">
import type { User } from '../schemas/user.schema'

defineProps<{
  user: User
}>()
</script>

<template>
  <article class="surface-card h-stack gap-4 p-4">
    <img
      v-if="user.avatarUrl"
      :src="user.avatarUrl"
      :alt="user.name"
      class="size-12 rounded-full object-cover"
    >
    <div v-else class="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
      {{ user.name.slice(0, 1).toUpperCase() }}
    </div>

    <div class="min-w-0">
      <h3 class="truncate text-sm font-medium text-foreground">
        {{ user.name }}
      </h3>
      <p class="truncate text-sm text-muted-foreground">
        {{ user.email }}
      </p>
    </div>
  </article>
</template>

