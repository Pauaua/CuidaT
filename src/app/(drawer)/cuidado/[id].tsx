import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ErrorState, Header, IconButton, Screen, SkeletonList } from '@/components/ui';
import { PersonDetailTabs } from '@/features/care/components/PersonDetailTabs';
import { useDeletePerson, usePerson } from '@/features/care/hooks/usePersons';
import { useMedicationsByPerson } from '@/features/medications/hooks/useMedications';
import { confirmAction } from '@/lib/confirm';
import { useTheme } from '@/theme';

export default function PersonDetailScreen() {
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = usePerson(id);
  const medications = useMedicationsByPerson(id);
  const remove = useDeletePerson();

  const onDelete = () => {
    if (!person.data) return;
    confirmAction(
      `¿Eliminar a ${person.data.nombre}?`,
      'Se borrarán también sus medicamentos y recordatorios. Esta acción no se puede deshacer.',
      () =>
        remove.mutate(
          { id: person.data.id, medicationIds: (medications.data ?? []).map((m) => m.id) },
          { onSuccess: () => router.back() }
        )
    );
  };

  return (
    <Screen refreshing={person.isRefetching} onRefresh={() => person.refetch()}>
      <Header
        title={person.data?.nombre ?? 'Ficha de cuidado'}
        showBack
        right={
          person.data ? (
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <IconButton
                icon="create-outline"
                accessibilityLabel="Editar datos"
                onPress={() => router.push({ pathname: '/form/persona', params: { id: person.data.id } })}
              />
              <IconButton icon="trash-outline" tone="danger" accessibilityLabel="Eliminar persona" onPress={onDelete} />
            </View>
          ) : null
        }
      />

      {person.isLoading ? (
        <SkeletonList />
      ) : person.isError || !person.data ? (
        <ErrorState message={person.error?.message} onRetry={() => person.refetch()} />
      ) : (
        <PersonDetailTabs person={person.data} />
      )}
    </Screen>
  );
}
