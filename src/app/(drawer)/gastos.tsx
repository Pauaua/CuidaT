import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  FAB,
  Header,
  Screen,
  SegmentedTabs,
  SkeletonList,
} from '@/components/ui';
import { usePersonNames } from '@/features/care/hooks/usePersons';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { ExpenseItem } from '@/features/expenses/components/ExpenseItem';
import { ExpenseSummaryCard } from '@/features/expenses/components/ExpenseSummaryCard';
import { categoriaTabs } from '@/features/expenses/constants';
import { useExpenses, useExpenseSummary } from '@/features/expenses/hooks/useExpenses';
import { useTheme } from '@/theme';
import type { CategoriaGasto } from '@/types/database';

export default function ExpensesScreen() {
  const { spacing } = useTheme();
  const [categoria, setCategoria] = useState<CategoriaGasto>('medicamento');
  const expenses = useExpenses(categoria);
  const summary = useExpenseSummary(expenses.data);
  const { names } = usePersonNames();
  const inventory = useInventory();
  const stockNames = new Map((inventory.data ?? []).map((i) => [i.id, i.nombre]));

  const openForm = (id?: string) =>
    router.push({ pathname: '/form/gasto', params: id ? { id } : { categoria } });

  const isMedication = categoria === 'medicamento';

  return (
    <Screen
      refreshing={expenses.isRefetching}
      onRefresh={() => expenses.refetch()}
      overlay={<FAB onPress={() => openForm()} accessibilityLabel="Agregar gasto" />}>
      <Header title="Gastos" subtitle="Lleva la cuenta de lo que compras" />

      <View style={{ gap: spacing.lg }}>
        <SegmentedTabs tabs={categoriaTabs} active={categoria} onChange={setCategoria} />

        {expenses.isLoading ? (
          <SkeletonList />
        ) : expenses.isError ? (
          <ErrorState message={expenses.error.message} onRetry={() => expenses.refetch()} />
        ) : !expenses.data || expenses.data.length === 0 ? (
          <EmptyState
            icon={isMedication ? 'medkit-outline' : 'bag-handle-outline'}
            title={isMedication ? 'Sin gastos en medicamentos' : 'Sin otros gastos'}
            message={
              isMedication
                ? 'Anota cuánto pagas y en qué farmacia. Con el tiempo te mostraremos dónde te conviene comprar.'
                : 'Pañales, insumos, transporte o lo que necesites: anótalo para saber cuánto se va en el cuidado.'
            }
            actionLabel="Agregar gasto"
            onAction={() => openForm()}
          />
        ) : (
          <>
            <ExpenseSummaryCard
              categoria={categoria}
              monthTotal={summary.monthTotal}
              cheapest={summary.cheapest}
            />
            <View style={{ gap: spacing.md }}>
              {expenses.data.map((g) => (
                <ExpenseItem
                  key={g.id}
                  expense={g}
                  personName={g.persona_cuidada_id ? names.get(g.persona_cuidada_id) : undefined}
                  stockName={g.inventario_id ? stockNames.get(g.inventario_id) : undefined}
                  onPress={() => openForm(g.id)}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
