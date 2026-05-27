import { View, Text, Pressable, StyleSheet } from 'react-native'
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
    <View style={styles.container}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.button, mode === opt.value && styles.active]}
          onPress={() => setMode(opt.value)}
        >
          <Text style={[styles.text, mode === opt.value && styles.activeText]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4 },
  button: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  active: { backgroundColor: '#171717' },
  text: { fontSize: 14, color: '#737373' },
  activeText: { color: '#fafafa' },
})
