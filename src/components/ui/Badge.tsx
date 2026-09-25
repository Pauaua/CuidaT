import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

type Props = {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Badge({ label, tone = 'primary', icon }: Props) {
  const { colors, radii, spacing } = useTheme();

  const bg = {
    primary: colors.primarySoft,
    secondary: colors.secondarySoft,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.surfaceAlt,
  }[tone];

  // Sobre los pasteles saturados usamos texto oscuro para asegurar contraste.
  const fg = ['success', 'warning', 'danger'].includes(tone) ? colors.textOnPastel : colors.text;

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xxs,
        backgroundColor: bg,
        borderRadius: radii.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
      }}>
      {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      <AppText variant="caption" style={{ color: fg, fontWeight: '600' }}>
        {label}
      </AppText>
    </View>
  );
}
