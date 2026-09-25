import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { InfoForm } from '@/features/info/components/InfoForm';
import { useDeleteInfo, useInfo } from '@/features/info/hooks/useInfos';
import { confirmAction } from '@/lib/confirm';

export default function InfoFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const info = useInfo(id);
  const remove = useDeleteInfo();

  const onDelete =
    id && info.data
      ? () =>
          confirmAction(`¿Eliminar ${info.data.nombre}?`, 'Se quitará de tus servicios útiles.', () =>
            remove.mutate(id, { onSuccess: () => router.back() })
          )
      : undefined;

  return (
    <FormScreen
      title={id ? 'Editar servicio' : 'Nuevo servicio útil'}
      isLoading={Boolean(id) && info.isLoading}
      error={info.error}
      onRetry={() => info.refetch()}
      onDelete={onDelete}
      deleteLabel="Eliminar servicio">
      <InfoForm info={info.data} onSaved={() => router.back()} />
    </FormScreen>
  );
}
