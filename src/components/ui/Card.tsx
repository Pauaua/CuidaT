import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useIsCompact } from '@/lib/layout';
import { useTheme, type ColorTokens } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  tone?: keyof ColorTokens;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  tone = 'surface',
  style,
}: Props) {
  const { colors, radii, spacing, shadows } = useTheme();
  const compact = useIsCompact();

  const baseStyle: ViewStyle = {
    backgroundColor: colors[tone],
    borderRadius: radii.lg,
    padding: compact ? spacing.md : spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.9 : 1 }, style]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}
