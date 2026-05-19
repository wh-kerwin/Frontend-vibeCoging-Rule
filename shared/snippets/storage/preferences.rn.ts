import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

const preferencesSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).default('system'),
})

export type Preferences = z.infer<typeof preferencesSchema>

const key = 'app.preferences'

export async function getPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(key)
  return preferencesSchema.parse(raw ? JSON.parse(raw) : {})
}

export async function setPreferences(preferences: Preferences) {
  await AsyncStorage.setItem(key, JSON.stringify(preferencesSchema.parse(preferences)))
}
