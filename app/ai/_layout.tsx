import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AiLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="chatbot" options={{ title: 'Vita AI' }} />
    </Stack>
  );
}
