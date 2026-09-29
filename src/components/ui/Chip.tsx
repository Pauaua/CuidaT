import { Pressable } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  accessibilityLabel?: string;
};

/** Chip seleccionable para filtros. */
export function Chip({ label, selected, onPress, color, accessibilityLabel }: Props) {
  const { colors, radii, spacing, touchTarget } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? `Filtro ${label}`}
      style={({ pressed }) => ({
        minHeight: touchTarget,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        borderRadius: radii.pill,
        borderWidth: 1.5,
        borderColor: selected ? colors.primaryDark : colors.border,
        backgroundColor: selected ? (color ?? colors.primarySoft) : pressed ? colors.surfaceAlt : colors.surface,
      })}>
      <AppText variant="label" style={{ color: selected ? colors.textOnPastel : colors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}
