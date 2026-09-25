import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { usePerson } from '@/features/care/hooks/usePersons';
import { MedicationForm } from '@/features/medications/components/MedicationForm';
import { useDeleteMedication, useMedication } from '@/features/medications/hooks/useMedications';
import { confirmAction } from '@/lib/confirm';

export default function MedicationFormScreen() {
  const { id, personaId } = useLocalSearchParams<{ id?: string; personaId: string }>();
  const medication = useMedication(id);
  const person = usePerson(personaId);
  const remove = useDeleteMedication();

  const onDelete =
    id && medication.data
      ? () =>
          confirmAction(
            `¿Eliminar ${medication.data.nombre}?`,
            'También se cancelarán sus recordatorios.',
            () => remove.mutate(id, { onSuccess: () => router.back() })
          )
      : undefined;

  return (
    <FormScreen
      title={id ? 'Editar medicamento' : 'Nuevo medicamento'}
      subtitle={person.data ? `Para ${person.data.nombre}` : undefined}
      isLoading={person.isLoading || (Boolean(id) && medication.isLoading)}
      error={person.error ?? medication.error}
      onRetry={() => {
        void person.refetch();
        if (id) void medication.refetch();
      }}
      onDelete={onDelete}
      deleteLabel="Eliminar medicamento">
      <MedicationForm
        personId={personaId}
        personName={person.data?.nombre ?? ''}
        medication={medication.data}
        onSaved={() => router.back()}
      />
    </FormScreen>
  );
}
