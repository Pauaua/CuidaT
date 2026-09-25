import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { AuthHero } from '@/features/auth/components/AuthHero';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useTheme } from '@/theme';

export default function RegisterScreen() {
  const { spacing } = useTheme();
  return (
    <Screen>
      <AuthHero subtitle="Un espacio para organizar el cuidado y también para cuidarte a ti." />
      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
          Crea tu cuenta
        </AppText>
        <RegisterForm />
      </Card>
      <View style={{ alignItems: 'center', marginTop: spacing.xl, gap: spacing.xs }}>
        <AppText color="textMuted">¿Ya tienes cuenta?</AppText>
        <Button
          title="Ingresar"
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
        />
      </View>
    </Screen>
  );
}
