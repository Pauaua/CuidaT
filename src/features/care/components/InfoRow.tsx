import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number | null | undefined;
};

/** Fila etiqueta/valor para fichas de detalle. */
export function InfoRow({ icon, label, value }: Props) {
  const { colors, spacing } = useTheme();
  const display = value === null || value === undefined || value === '' ? 'Sin información' : String(value);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${display}`}
      style={{ flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm }}>
      <Ionicons name={icon} size={22} color={colors.primaryDark} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText color={display === 'Sin información' ? 'textMuted' : 'text'}>{display}</AppText>
      </View>
    </View>
  );
}
