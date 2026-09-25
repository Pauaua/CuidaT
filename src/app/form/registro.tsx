import { router } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { usePersons } from '@/features/care/hooks/usePersons';
import { RecordForm } from '@/features/records/components/RecordForm';

export default function RecordFormScreen() {
  const persons = usePersons();
  return (
    <FormScreen
      title="Nuevo registro"
      subtitle="Anota lo que hiciste o notaste"
      isLoading={persons.isLoading}
      error={persons.error}
      onRetry={() => persons.refetch()}>
      <RecordForm onSaved={() => router.back()} />
    </FormScreen>
  );
}
