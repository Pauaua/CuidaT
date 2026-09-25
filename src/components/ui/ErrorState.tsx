import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  const { colors, spacing } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.md }}>
      <Ionicons name="cloud-offline-outline" size={56} color={colors.dangerText} />
      <AppText variant="subtitle" align="center">
        Ups, algo no cargó bien
      </AppText>
      <AppText color="textMuted" align="center">
        {message ?? 'No es tu culpa. Revisa tu conexión e inténtalo otra vez.'}
      </AppText>
      {onRetry ? <Button title="Reintentar" variant="secondary" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}
