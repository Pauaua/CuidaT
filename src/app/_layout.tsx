import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/features/auth/hooks/AuthProvider';
import { configureNotifications } from '@/features/medications/services/notificationService';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { SettingsProvider, useSettings } from '@/features/settings/hooks/SettingsProvider';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();
configureNotifications();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { settings } = useSettings();
  return (
    <ThemeProvider preference={settings.themePreference}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const { loaded } = useSettings();
  const { session, initializing } = useAuth();
  const profile = useProfile();

  const isSignedIn = Boolean(session);
  const profileReady = !isSignedIn || !profile.isPending;
  const ready = loaded && !initializing && profileReady;

  const hasProfile = isSignedIn && Boolean(profile.data);
  const isPaused = hasProfile && Boolean(profile.data?.pausada_en);
  const isActive = hasProfile && !isPaused;
  const needsOnboarding = isSignedIn && profile.isSuccess && !profile.data;
  const profileFailed = isSignedIn && profile.isError;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      primary: theme.colors.primaryDark,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={needsOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={profileFailed}>
          <Stack.Screen name="sin-conexion" />
        </Stack.Protected>

        <Stack.Protected guard={isPaused}>
          <Stack.Screen name="cuenta-pausada" />
        </Stack.Protected>

        <Stack.Protected guard={isActive}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="form/persona" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/medicamento" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/inventario" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/evento" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/registro" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/informacion" options={{ presentation: 'modal' }} />
          <Stack.Screen name="form/gasto" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}
