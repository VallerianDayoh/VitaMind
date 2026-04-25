import React from 'react';
import { ConvexProvider as ConvexProviderOriginal, ConvexReactClient } from 'convex/react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

interface Props {
  children: React.ReactNode;
}

export function ConvexClientProvider({ children }: Props) {
  return (
    <ConvexProviderOriginal client={convex}>
      {children}
    </ConvexProviderOriginal>
  );
}
