import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge, Card } from '@/components/ui';
import { isLowStock, unitsLabel } from '@/features/inventory/constants';
import { normalizeTime } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { ItemInventario, Medicamento } from '@/types/database';

type Props = {
  medication: Medicamento;
  /** Ítem del inventario vinculado (si existe). */
  stock?: ItemInventario;
  onPress: () => void;
};

export function MedicationCard({ medication, stock, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const times = medication.horas_toma.map(normalizeTime);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${medication.nombre}, ${medication.dosis}, ${times.length} tomas al día`}
      accessibilityHint="Abre el medicamento para editarlo">
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.secondarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="medkit-outline" size={24} color={colors.secondaryDark} />
        </View>
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <AppText variant="subtitle">{medication.nombre}</AppText>
          <AppText color="textMuted">
            {medication.dosis}
            {medication.laboratorio ? ` · ${medication.laboratorio}` : ''}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs }}>
            {times.map((t) => (
              <Badge key={t} label={t} icon="alarm-outline" tone="primary" />
            ))}
          </View>
          {stock ? (
            <AppText variant="caption" color={isLowStock(stock) ? 'dangerText' : 'textMuted'} style={{ marginTop: spacing.xs }}>
              Descuenta {unitsLabel(medication.unidades_por_toma)} por toma de “{stock.nombre}” · quedan{' '}
              {unitsLabel(stock.cantidad)}
            </AppText>
          ) : null}
          {medication.indicaciones_especiales ? (
            <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
              {medication.indicaciones_especiales}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
