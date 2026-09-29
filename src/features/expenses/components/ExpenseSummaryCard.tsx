import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { capitalize } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { CategoriaGasto } from '@/types/database';

import { categoriaLabels, formatCLP } from '../constants';
import type { CheapestOption } from '../hooks/useExpenses';

type Props = {
  categoria: CategoriaGasto;
  monthTotal: number;
  cheapest: CheapestOption[];
};

export function ExpenseSummaryCard({ categoria, monthTotal, cheapest }: Props) {
  const { colors, spacing } = useTheme();
  const month = capitalize(new Date().toLocaleDateString('es-CL', { month: 'long' }));

  return (
    <View style={{ gap: spacing.md }}>
      <Card tone="primarySoft">
        <AppText variant="caption" color="textMuted">
          {categoriaLabels[categoria]} · {month}
        </AppText>
        <AppText variant="display" color="primaryDark" accessibilityLabel={`Total del mes: ${formatCLP(monthTotal)}`}>
          {formatCLP(monthTotal)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          Gastado este mes
        </AppText>
      </Card>

      {cheapest.length > 0 ? (
        <Card tone="successSoft">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
            <Ionicons name="pricetags-outline" size={20} color={colors.text} />
            <AppText variant="subtitle" accessibilityRole="header">
              Dónde está más barato
            </AppText>
          </View>
          <View style={{ gap: spacing.sm }}>
            {cheapest.slice(0, 5).map((c) => (
              <View
                key={c.nombre}
                accessible
                accessibilityLabel={`${c.nombre}: más barato en ${c.lugar}, ${formatCLP(c.precioUnitario)} por unidad`}>
                <AppText variant="label">{c.nombre}</AppText>
                <AppText variant="caption">
                  En <AppText variant="caption" style={{ fontWeight: '700' }}>{c.lugar}</AppText> a{' '}
                  {formatCLP(c.precioUnitario)} c/u
                  {c.ahorroUnitario >= 1 ? ` · ahorras hasta ${formatCLP(c.ahorroUnitario)} c/u` : ''}
                </AppText>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
}
