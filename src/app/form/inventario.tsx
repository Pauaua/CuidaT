import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { InventoryForm } from '@/features/inventory/components/InventoryForm';
import { useDeleteInventoryItem, useInventoryItem } from '@/features/inventory/hooks/useInventory';
import { confirmAction } from '@/lib/confirm';

export default function InventoryFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const item = useInventoryItem(id);
  const remove = useDeleteInventoryItem();

  const onDelete =
    id && item.data
      ? () =>
          confirmAction(`¿Eliminar ${item.data.nombre}?`, 'Se quitará del inventario.', () =>
            remove.mutate(id, { onSuccess: () => router.back() })
          )
      : undefined;

  return (
    <FormScreen
      title={id ? 'Editar ítem' : 'Nuevo ítem'}
      isLoading={Boolean(id) && item.isLoading}
      error={item.error}
      onRetry={() => item.refetch()}
      onDelete={onDelete}
      deleteLabel="Eliminar ítem">
      <InventoryForm item={item.data} onSaved={() => router.back()} />
    </FormScreen>
  );
}
