import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { AuthHero } from '@/features/auth/components/AuthHero';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const { spacing } = useTheme();
  return (
    <Screen>
      <AuthHero subtitle={APP_CONFIG.tagline} />
      <Card>
        <LoginForm />
      </Card>
      <View style={{ alignItems: 'center', marginTop: spacing.xl, gap: spacing.xs }}>
        <AppText color="textMuted">¿Primera vez por aquí?</AppText>
        <Button title="Crear una cuenta" variant="secondary" onPress={() => router.push('/register')} />
      </View>
    </Screen>
  );
}
