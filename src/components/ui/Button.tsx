import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  compact = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) {
  const { colors, radii, spacing, touchTarget } = useTheme();

  const palette = {
    primary: { bg: colors.primaryDark, fg: colors.onPrimary, border: colors.primaryDark },
    secondary: { bg: colors.secondarySoft, fg: colors.text, border: colors.secondary },
    ghost: { bg: 'transparent', fg: colors.primaryDark, border: 'transparent' },
    danger: { bg: colors.dangerSoft, fg: colors.dangerText, border: colors.danger },
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={compact ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: touchTarget,
          borderRadius: radii.md,
          paddingHorizontal: compact ? spacing.sm : spacing.lg,
          paddingVertical: compact ? spacing.xs : spacing.sm,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={[styles.content, { gap: spacing.xs }]}>
          {icon ? <Ionicons name={icon} size={22} color={palette.fg} /> : null}
          <AppText variant="label" style={{ color: palette.fg }} numberOfLines={2} align="center">
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
});
