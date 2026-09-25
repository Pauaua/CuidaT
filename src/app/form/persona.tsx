import { router, useLocalSearchParams } from 'expo-router';

import { FormScreen } from '@/components/form/FormScreen';
import { PersonForm } from '@/features/care/components/PersonForm';
import { usePerson } from '@/features/care/hooks/usePersons';

export default function PersonFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const person = usePerson(id);

  return (
    <FormScreen
      title={id ? 'Editar persona' : 'Nueva persona cuidada'}
      isLoading={Boolean(id) && person.isLoading}
      error={person.error}
      onRetry={() => person.refetch()}>
      <PersonForm
        person={person.data}
        onSaved={(saved) => {
          if (id) router.back();
          else router.replace({ pathname: '/cuidado/[id]', params: { id: saved.id } });
        }}
      />
    </FormScreen>
  );
}
