import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { formatShortDate, fromISODate } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Gasto } from '@/types/database';

import { categoriaIcons, formatCLP } from '../constants';

type Props = {
  expense: Gasto;
  personName?: string;
  /** Nombre del ítem del inventario al que se sumó la compra */
  stockName?: string;
  onPress: () => void;
};

export function ExpenseItem({ expense, personName, stockName, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const date = formatShortDate(fromISODate(expense.fecha));
  const unit = expense.cantidad > 1 ? ` · ${formatCLP(expense.precio / expense.cantidad)} c/u` : '';

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${expense.nombre}, ${formatCLP(expense.precio)}, ${date}${expense.lugar ? `, en ${expense.lugar}` : ''}`}
      accessibilityHint="Abre el gasto para editarlo">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.secondarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={categoriaIcons[expense.categoria]} size={22} color={colors.secondaryDark} />
        </View>
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xs }}>
            <AppText variant="label" style={{ flexShrink: 1 }}>
              {expense.nombre}
            </AppText>
            <AppText variant="label" color="primaryDark">
              {formatCLP(expense.precio)}
            </AppText>
          </View>
          <AppText variant="caption" color="textMuted">
            {date}
            {expense.cantidad > 1 ? ` · ${expense.cantidad} unidades` : ''}
            {unit}
          </AppText>
          {expense.lugar ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
              <Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted">
                {expense.lugar}
              </AppText>
            </View>
          ) : null}
          {stockName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
              <Ionicons name="cube-outline" size={14} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted">
                +{expense.cantidad} en Inventario ({stockName})
              </AppText>
            </View>
          ) : null}
          {personName ? (
            <AppText variant="caption" color="textMuted">
              Para {personName}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
