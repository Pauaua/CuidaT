import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge, Button } from '@/components/ui';
import { isLowStock, unitsLabel } from '@/features/inventory/constants';
import { useTheme } from '@/theme';
import type { ItemInventario } from '@/types/database';

import type { Dose } from '../hooks/useTodayDoses';

type Props = {
  dose: Dose;
  /** Ítem del inventario vinculado, para mostrar cuánto queda. */
  stock?: ItemInventario;
  onMarkGiven: () => void;
  loading: boolean;
};

export function DoseItem({ dose, stock, onMarkGiven, loading }: Props) {
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {dose.pending ? <Badge label="Pendiente" tone="warning" icon="time-outline" /> : null}
          {stock ? (
            <Badge
              label={`Quedan ${unitsLabel(stock.cantidad)}`}
              tone={isLowStock(stock) ? 'warning' : 'neutral'}
              icon={isLowStock(stock) ? 'alert-circle-outline' : 'cube-outline'}
            />
          ) : null}
        </View>
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
