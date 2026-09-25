import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge } from '@/components/ui';
import { dateToTime } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Registro } from '@/types/database';

import { tipoRegistroIcons, tipoRegistroLabels } from '../constants';

type Props = {
  record: Registro;
  personName?: string;
  isLast: boolean;
};

export function RecordTimelineItem({ record, personName, isLast }: Props) {
  const { colors, spacing, radii } = useTheme();
  const date = new Date(record.fecha_hora);

  return (
    <View
      accessible
      accessibilityLabel={`${dateToTime(date)}, ${tipoRegistroLabels[record.tipo]}: ${record.descripcion}${personName ? `, ${personName}` : ''}`}
      style={{ flexDirection: 'row', gap: spacing.md }}>
      <View style={{ alignItems: 'center', width: 44 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={tipoRegistroIcons[record.tipo]} size={22} color={colors.primaryDark} />
        </View>
        {!isLast ? <View style={{ flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 }} /> : null}
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.md,
          gap: spacing.xxs,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.xs }}>
          <Badge label={tipoRegistroLabels[record.tipo]} tone="secondary" />
          <AppText variant="label" color="textMuted">
            {dateToTime(date)}
          </AppText>
        </View>
        <AppText>{record.descripcion}</AppText>
        {personName ? (
          <AppText variant="caption" color="textMuted">
            {personName}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
