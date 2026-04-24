import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from 'expo-router';

// 1. Inisialisasi client dengan URL dari env file
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function RootLayout() {
  return (
    // 2. Bungkus aplikasi kamu dengan Provider ini
    <ConvexProvider client={convex}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </ConvexProvider>
  );
}