<script setup lang="ts">
import { toRef } from 'vue'
import UserProfileCard from '../components/UserProfileCard.vue'
import { useUserProfile } from '../composables/useUserProfile'

const props = defineProps<{
  userId: string
}>()

const { data, error, isLoading, isEmpty } = useUserProfile(toRef(props, 'userId'))
</script>

<template>
  <main class="mx-auto max-w-3xl p-6">
    <div v-if="isLoading" class="surface-card h-24 animate-pulse" />

    <div v-else-if="error" class="surface-card p-4 text-sm text-destructive">
      {{ error.message }}
    </div>

    <div v-else-if="isEmpty" class="surface-card p-4 text-sm text-muted-foreground">
      No user profile found.
    </div>

    <UserProfileCard v-else :user="data!" />
  </main>
</template>

