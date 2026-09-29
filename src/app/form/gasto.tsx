import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { categoriaLabels, isCategoria } from '@/features/expenses/constants';
import { useDeleteExpense, useExpense } from '@/features/expenses/hooks/useExpenses';
import { confirmAction } from '@/lib/confirm';

export default function ExpenseFormScreen() {
  const params = useLocalSearchParams<{ id?: string; categoria?: string }>();
  const { id } = params;
  const expense = useExpense(id);
  const remove = useDeleteExpense();
  const categoria = expense.data?.categoria ?? (isCategoria(params.categoria) ? params.categoria : 'medicamento');

  const onDelete =
    id && expense.data
      ? () =>
          confirmAction(
            `¿Eliminar el gasto "${expense.data.nombre}"?`,
            expense.data.inventario_id
              ? `Se quitará de tus gastos y se restarán ${expense.data.cantidad} unidades del inventario.`
              : 'Se quitará de tu registro de gastos.',
            () => remove.mutate(id, { onSuccess: () => router.back() })
          )
      : undefined;

  return (
    <FormScreen
      title={id ? 'Editar gasto' : 'Nuevo gasto'}
      subtitle={categoriaLabels[categoria]}
      isLoading={Boolean(id) && expense.isLoading}
      error={expense.error}
      onRetry={() => expense.refetch()}
      onDelete={onDelete}
      deleteLabel="Eliminar gasto">
      <ExpenseForm categoria={categoria} expense={expense.data} onSaved={() => router.back()} />
    </FormScreen>
  );
}
