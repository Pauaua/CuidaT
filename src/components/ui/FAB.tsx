import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Botón flotante para agregar. */
export function FAB({ onPress, accessibilityLabel, icon = 'add' }: Props) {
  const { colors, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const size = 64;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: spacing.lg + insets.right,
          bottom: spacing.lg,
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primaryDark,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        shadows.medium,
      ]}>
      <Ionicons name={icon} size={32} color={colors.onPrimary} />
    </Pressable>
  );
}
