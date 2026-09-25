import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ErrorState, FAB, Header, Screen, SkeletonList } from '@/components/ui';
import { PersonCard } from '@/features/care/components/PersonCard';
import { usePersons } from '@/features/care/hooks/usePersons';
import { useMedications } from '@/features/medications/hooks/useMedications';
import { useTheme } from '@/theme';

export default function CareListScreen() {
  const { spacing } = useTheme();
  const persons = usePersons();
  const medications = useMedications();

  const countFor = (personId: string) =>
    (medications.data ?? []).filter((m) => m.persona_cuidada_id === personId).length;

  const openNew = () => router.push('/form/persona');

  return (
    <Screen
      refreshing={persons.isRefetching}
      onRefresh={() => {
        void persons.refetch();
        void medications.refetch();
      }}
      overlay={persons.data && persons.data.length > 0 ? <FAB onPress={openNew} accessibilityLabel="Agregar persona cuidada" /> : null}>
      <Header title="Cuidado" subtitle="Las personas que acompañas" />

      {persons.isLoading ? (
        <SkeletonList />
      ) : persons.isError ? (
        <ErrorState message={persons.error.message} onRetry={() => persons.refetch()} />
      ) : !persons.data || persons.data.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Aún no agregas a nadie"
          message="Agrega a la persona que cuidas para organizar sus medicamentos, rutinas y datos importantes."
          actionLabel="Agregar persona"
          onAction={openNew}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {persons.data.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              medicationCount={countFor(person.id)}
              onPress={() => router.push({ pathname: '/cuidado/[id]', params: { id: person.id } })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
