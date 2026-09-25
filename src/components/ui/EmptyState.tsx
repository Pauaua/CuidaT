import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

/** Estado vacío con una pequeña ilustración hecha de formas suaves e íconos. */
export function EmptyState({ title, message, icon = 'heart-outline', actionLabel, onAction }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ width: 150, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 4,
            top: 10,
            width: '34%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: colors.secondarySoft,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 8,
            bottom: 14,
            width: '20%',
            aspectRatio: 1,
            borderRadius: 999,
            backgroundColor: colors.successSoft,
          }}
        />
        <Ionicons name={icon} size={64} color={colors.primaryDark} />
        <Ionicons
          name="sparkles"
          size={22}
          color={colors.secondaryDark}
          style={{ position: 'absolute', right: 18, top: 22 }}
        />
      </View>
      <AppText variant="subtitle" align="center" accessibilityRole="header">
        {title}
      </AppText>
      <AppText color="textMuted" align="center">
        {message}
      </AppText>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} icon="add" /> : null}
    </View>
  );
}
