import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { ConvexClientProvider } from '../providers/ConvexProvider';

function RootLayoutNav() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRootIndex = !segments[0];

    // Don't interrupt the splash screen (app/index.tsx)
    if (isRootIndex) return;

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        // @ts-ignore
        router.replace('/(tabs)');
      }
    }, 1);
  }, [isAuthenticated, segments, navigationState?.key, isMounted]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="checkin" options={{ headerShown: false }} />
      <Stack.Screen name="ai" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <RootLayoutNav />
    </ConvexClientProvider>
  );
}
