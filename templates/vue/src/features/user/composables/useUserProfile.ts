import { computed, ref, watchEffect, type Ref } from 'vue'
import { toAppError, type AppError } from '@/shared/http/errors'
import { getUserProfile } from '../api/user.api'
import type { User } from '../schemas/user.schema'

export function useUserProfile(userId: Ref<string>) {
  const data = ref<User | null>(null)
  const error = ref<AppError | null>(null)
  const isLoading = ref(false)

  watchEffect(async (onCleanup) => {
    const id = userId.value
    // AbortController actually cancels the in-flight request when userId changes,
    // rather than just discarding the response after arrival.
    const ac = new AbortController()
    onCleanup(() => ac.abort())

    isLoading.value = true
    error.value = null
    data.value = null

    try {
      const user = await getUserProfile(id, { signal: ac.signal })
      data.value = user
    } catch (err) {
      // Ignore aborted requests – they are not real errors from the user's POV.
      if ((err as Error)?.name !== 'AbortError') {
        error.value = toAppError(err)
      }
    } finally {
      if (!ac.signal.aborted) {
        isLoading.value = false
      }
    }
  })

  return {
    data,
    error,
    isLoading,
    isEmpty: computed(() => !isLoading.value && !error.value && !data.value),
  }
}

