import { View } from 'react-native';

import { AppText, Button, Header, Screen } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useTheme } from '@/theme';

export default function OnboardingScreen() {
  const { spacing } = useTheme();
  const { session } = useAuth();
  const signOut = useSignOut();

  return (
    <Screen>
      <Header title={`Te damos la bienvenida a ${APP_CONFIG.name}`} />
      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        <AppText variant="bodyLarge">
          Antes de empezar, cuéntanos un poco de ti. Cuidar a otra persona es mucho trabajo, y aquí
          también nos importa cómo estás tú.
        </AppText>
        <AppText color="textMuted">Solo el nombre y el correo son obligatorios. Lo demás lo puedes completar después.</AppText>
      </View>
      {/* Al guardar, el guard del layout raíz lleva automáticamente al inicio */}
      <ProfileForm profile={null} email={session?.user.email ?? ''} submitLabel="Comenzar" />
      <Button
        title="Usar otra cuenta"
        variant="ghost"
        onPress={() => signOut.mutate()}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}
