import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome / Landing screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Auth group — maps to app/auth/_layout.tsx (or app/auth/index.tsx) */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />

        {/* Main Authenticated App */}
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}