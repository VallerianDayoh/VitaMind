import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function CheckinLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Check-in Harian' }} />
      <Stack.Screen name="mood" options={{ title: 'Catat Mood' }} />
      <Stack.Screen name="sleep" options={{ title: 'Catat Tidur' }} />
      <Stack.Screen name="stress" options={{ title: 'Tingkat Stres' }} />
      <Stack.Screen name="activity" options={{ title: 'Catat Aktivitas' }} />
    </Stack>
  );
}
