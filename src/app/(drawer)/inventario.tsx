import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Chip, EmptyState, ErrorState, FAB, Header, Screen, SkeletonList } from '@/components/ui';
import { usePersonNames } from '@/features/care/hooks/usePersons';
import { InventoryItemCard } from '@/features/inventory/components/InventoryItemCard';
import { isLowStock, tipoInventarioOptions } from '@/features/inventory/constants';
import { useAdjustInventory, useInventory } from '@/features/inventory/hooks/useInventory';
import { useContentWidth } from '@/lib/layout';
import { useTheme } from '@/theme';
import type { TipoInventario } from '@/types/database';

type Filter = TipoInventario | 'todos' | 'bajo';

const filterLabels: Record<TipoInventario, string> = {
  medicamento: 'Medicamentos',
  insumo: 'Insumos',
  otro: 'Otros',
};

export default function InventoryScreen() {
  const { spacing } = useTheme();
  const columns = useContentWidth() >= 640 ? 2 : 1;
  const [filter, setFilter] = useState<Filter>('todos');

  const inventory = useInventory();
  const { names } = usePersonNames();
  const adjust = useAdjustInventory();

  const items = (inventory.data ?? []).filter((item) => {
    if (filter === 'todos') return true;
    if (filter === 'bajo') return isLowStock(item);
    return item.tipo === filter;
  });

  const openForm = (id?: string) => router.push({ pathname: '/form/inventario', params: id ? { id } : {} });
  const hasItems = (inventory.data?.length ?? 0) > 0;

  return (
    <Screen
      refreshing={inventory.isRefetching}
      onRefresh={() => inventory.refetch()}
      overlay={hasItems ? <FAB onPress={() => openForm()} accessibilityLabel="Agregar al inventario" /> : null}>
      <Header title="Inventario" subtitle="Medicamentos e insumos en casa" />

      {hasItems ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.md }}>
          <Chip label="Todos" selected={filter === 'todos'} onPress={() => setFilter('todos')} />
          <Chip label="Queda poco" selected={filter === 'bajo'} onPress={() => setFilter('bajo')} />
          {tipoInventarioOptions.map((o) => (
            <Chip
              key={o.value}
              label={filterLabels[o.value]}
              selected={filter === o.value}
              onPress={() => setFilter(o.value)}
            />
          ))}
        </ScrollView>
      ) : null}

      {inventory.isLoading ? (
        <SkeletonList />
      ) : inventory.isError ? (
        <ErrorState message={inventory.error.message} onRetry={() => inventory.refetch()} />
      ) : !hasItems ? (
        <EmptyState
          icon="cube-outline"
          title="Tu inventario está vacío"
          message="Anota lo que tienes en casa y te avisaremos antes de que se acabe."
          actionLabel="Agregar ítem"
          onAction={() => openForm()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Nada por aquí"
          message={filter === 'bajo' ? '¡Buenas noticias! No hay nada por acabarse.' : 'No hay ítems de este tipo.'}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {items.map((item) => (
            <View key={item.id} style={{ width: columns === 2 ? '48.5%' : '100%' }}>
              <InventoryItemCard
                item={item}
                personName={item.persona_cuidada_id ? names.get(item.persona_cuidada_id) : undefined}
                onPress={() => openForm(item.id)}
                onAdjust={(delta) => adjust.mutate({ id: item.id, delta })}
              />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
