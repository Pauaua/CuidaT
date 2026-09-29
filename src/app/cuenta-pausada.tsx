import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { useResumeAccount } from '@/features/profile/hooks/useAccountActions';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { formatShortDate } from '@/lib/dates';
import { useTheme } from '@/theme';

export default function PausedAccountScreen() {
  const { colors, spacing } = useTheme();
  const profile = useProfile();
  const resume = useResumeAccount();
  const signOut = useSignOut();

  const pausedAt = profile.data?.pausada_en ? new Date(profile.data.pausada_en) : null;
  const firstName = profile.data?.nombre.split(' ')[0] ?? '';

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, marginBottom: spacing.xl }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="pause" size={44} color={colors.primaryDark} />
        </View>
        <AppText variant="title" align="center" accessibilityRole="header">
          Tu cuenta está en pausa
        </AppText>
        <AppText color="textMuted" align="center">
          {firstName ? `${firstName}, ` : ''}está bien tomarse un respiro. Mientras tanto no te
          enviaremos recordatorios, y toda tu información sigue guardada tal como la dejaste.
        </AppText>
        {pausedAt ? (
          <AppText variant="caption" color="textMuted">
            En pausa desde el {formatShortDate(pausedAt)}
          </AppText>
        ) : null}
      </View>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Reactivar mi cuenta"
            icon="play"
            fullWidth
            loading={resume.isPending}
            onPress={() => profile.data && resume.mutate(profile.data.id)}
          />
          {resume.error ? (
            <AppText color="dangerText" accessibilityRole="alert">
              {resume.error.message}
            </AppText>
          ) : null}
          <Button
            title="Cerrar sesión"
            variant="ghost"
            icon="log-out-outline"
            loading={signOut.isPending}
            onPress={() => signOut.mutate()}
          />
        </View>
      </Card>
    </Screen>
  );
}
