import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { EventForm } from '@/features/recreation/components/EventForm';
import { useDeleteEvent, useEvent } from '@/features/recreation/hooks/useEvents';
import { confirmAction } from '@/lib/confirm';
import { fromISODate } from '@/lib/dates';

export default function EventFormScreen() {
  const { id, fecha } = useLocalSearchParams<{ id?: string; fecha?: string }>();
  const event = useEvent(id);
  const remove = useDeleteEvent();
  const initialDate = fecha ? fromISODate(fecha) : new Date();

  const onDelete =
    id && event.data
      ? () =>
          confirmAction(`¿Eliminar "${event.data.titulo}"?`, 'Se quitará de tu agenda.', () =>
            remove.mutate(id, { onSuccess: () => router.back() })
          )
      : undefined;

  return (
    <FormScreen
      title={id ? 'Editar evento' : 'Nuevo evento'}
      subtitle={id ? undefined : 'Tu tiempo también se agenda'}
      isLoading={Boolean(id) && event.isLoading}
      error={event.error}
      onRetry={() => event.refetch()}
      onDelete={onDelete}
      deleteLabel="Eliminar evento">
      <EventForm event={event.data} initialDate={initialDate} onSaved={() => router.back()} />
    </FormScreen>
  );
}
