import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge, Button } from '@/components/ui';
import { useTheme } from '@/theme';

import type { Dose } from '../hooks/useTodayDoses';

type Props = {
  dose: Dose;
  onMarkGiven: () => void;
  loading: boolean;
};

export function DoseItem({ dose, onMarkGiven, loading }: Props) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: dose.given ? colors.successSoft : colors.surfaceAlt,
      }}>
      <View style={{ alignItems: 'center', minWidth: 56 }}>
        <AppText variant="subtitle" color="primaryDark">
          {dose.time}
        </AppText>
      </View>
      <View style={{ flex: 1, minWidth: 140, gap: spacing.xxs }}>
        <AppText variant="label">{dose.medication.nombre}</AppText>
        <AppText variant="caption" color="textMuted">
          {dose.medication.dosis} · {dose.personName}
        </AppText>
        {dose.pending ? <Badge label="Pendiente" tone="warning" icon="time-outline" /> : null}
      </View>
      {dose.given ? (
        <View
          accessible
          accessibilityLabel="Toma registrada como dada"
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
          <Ionicons name="checkmark-circle" size={26} color={colors.primaryDark} />
          <AppText variant="label">Dado</AppText>
        </View>
      ) : (
        <Button
          title="Marcar como dado"
          compact
          onPress={onMarkGiven}
          loading={loading}
          accessibilityLabel={`Marcar ${dose.medication.nombre} de las ${dose.time} como dado`}
        />
      )}
    </View>
  );
}
