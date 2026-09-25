import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Card, Skeleton } from '@/components/ui';
import { useTheme } from '@/theme';

import { useLowStockItems } from '../hooks/useInventory';

/** Tarjeta del inicio con los ítems que se están acabando. */
export function LowStockAlerts() {
  const { colors, spacing } = useTheme();
  const low = useLowStockItems();

  if (low.isLoading) return <Skeleton height={80} />;
  if (low.isError || !low.data || low.data.length === 0) return null;

  return (
    <Card
      tone="warningSoft"
      onPress={() => router.push('/inventario')}
      accessibilityLabel={`Alerta: ${low.data.length} ítems del inventario con stock bajo`}
      accessibilityHint="Abre el inventario"
      style={{ borderColor: colors.warning, borderWidth: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <Ionicons name="alert-circle" size={26} color={colors.text} />
        <AppText variant="subtitle">Queda poco de…</AppText>
      </View>
      {low.data.slice(0, 5).map((item) => (
        <View
          key={item.id}
          style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xxs }}>
          <AppText style={{ flex: 1 }}>{item.nombre}</AppText>
          <AppText variant="label">
            {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}
          </AppText>
        </View>
      ))}
      {low.data.length > 5 ? (
        <AppText color="textMuted" style={{ marginTop: spacing.xs }}>
          y {low.data.length - 5} más…
        </AppText>
      ) : null}
    </Card>
  );
}
