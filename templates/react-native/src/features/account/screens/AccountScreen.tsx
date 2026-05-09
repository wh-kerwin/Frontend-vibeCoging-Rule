import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native'
import { useAccount } from '../hooks/useAccount'

export function AccountScreen() {
  const { data, error, isLoading } = useAccount()

  if (isLoading) {
    return (
      <SafeAreaView>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView>
        <Text>{error.message}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <View>
        <Text>{data?.name ?? 'No account'}</Text>
      </View>
    </SafeAreaView>
  )
}

