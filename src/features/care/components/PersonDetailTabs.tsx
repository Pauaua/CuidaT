import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Badge, Button, Card, EmptyState, ErrorState, SkeletonList } from '@/components/ui';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { MedicationCard } from '@/features/medications/components/MedicationCard';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { useMedicationsByPerson } from '@/features/medications/hooks/useMedications';
import { callPhone, openInMaps } from '@/lib/linking';
import { useTheme } from '@/theme';
import type { PersonaCuidada } from '@/types/database';

import { nivelDependenciaLabels, nivelDependenciaTones } from '../constants';
import { InfoRow } from './InfoRow';

type TabKey = 'datos' | 'medicamentos' | 'rutinas' | 'comentarios';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'datos', label: 'Datos' },
  { key: 'medicamentos', label: 'Medicamentos' },
  { key: 'rutinas', label: 'Rutinas' },
  { key: 'comentarios', label: 'Comentarios' },
];

export function PersonDetailTabs({ person }: { person: PersonaCuidada }) {
  const { spacing } = useTheme();
  const [active, setActive] = useState<TabKey>('datos');

  return (
    <View style={{ gap: spacing.lg }}>
      <SegmentedTabs tabs={tabs} active={active} onChange={setActive} />
      {active === 'datos' ? <DataTab person={person} /> : null}
      {active === 'medicamentos' ? <MedicationsTab person={person} /> : null}
      {active === 'rutinas' ? <RoutinesTab person={person} /> : null}
      {active === 'comentarios' ? <CommentsTab person={person} /> : null}
    </View>
  );
}

function DataTab({ person }: { person: PersonaCuidada }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <Card>
        <Badge
          label={nivelDependenciaLabels[person.nivel_dependencia]}
          tone={nivelDependenciaTones[person.nivel_dependencia]}
        />
        <InfoRow icon="person-outline" label="Edad" value={person.edad ? `${person.edad} años` : null} />
        <InfoRow icon="fitness-outline" label="Condición o enfermedad" value={person.condicion_enfermedad} />
        <InfoRow icon="call-outline" label="Teléfono" value={person.telefono} />
        <InfoRow icon="home-outline" label="Dirección" value={person.direccion} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          {person.telefono ? (
            <Button title="Llamar" icon="call" variant="secondary" onPress={() => callPhone(person.telefono ?? '')} />
          ) : null}
          {person.direccion ? (
            <Button title="Ver en mapa" icon="map" variant="secondary" onPress={() => openInMaps(person.direccion ?? '')} />
          ) : null}
        </View>
      </Card>
      <Card>
        <InfoRow icon="body-outline" label="Necesidades físicas" value={person.necesidades_fisicas} />
        <InfoRow icon="happy-outline" label="Necesidades mentales o emocionales" value={person.necesidades_mentales} />
      </Card>
    </View>
  );
}

function MedicationsTab({ person }: { person: PersonaCuidada }) {
  const { spacing } = useTheme();
  const meds = useMedicationsByPerson(person.id);
  const inventory = useInventory();
  const stockById = new Map((inventory.data ?? []).map((i) => [i.id, i]));

  const openForm = (medId?: string) =>
    router.push({ pathname: '/form/medicamento', params: { personaId: person.id, id: medId } });

  if (meds.isLoading) return <SkeletonList count={2} />;
  if (meds.isError) return <ErrorState message={meds.error.message} onRetry={() => meds.refetch()} />;

  return (
    <View style={{ gap: spacing.md }}>
      {meds.data && meds.data.length > 0 ? (
        <>
          {meds.data.map((m) => (
            <MedicationCard
              key={m.id}
              medication={m}
              stock={m.inventario_id ? stockById.get(m.inventario_id) : undefined}
              onPress={() => openForm(m.id)}
            />
          ))}
          <Button title="Agregar medicamento" icon="add" variant="secondary" onPress={() => openForm()} />
        </>
      ) : (
        <EmptyState
          icon="medkit-outline"
          title="Sin medicamentos por ahora"
          message={`Agrega los medicamentos de ${person.nombre} y te recordaremos cada toma.`}
          actionLabel="Agregar medicamento"
          onAction={() => openForm()}
        />
      )}
    </View>
  );
}

function RoutinesTab({ person }: { person: PersonaCuidada }) {
  const { colors, spacing } = useTheme();
  const goEdit = () => router.push({ pathname: '/form/persona', params: { id: person.id } });

  if (person.rutinas.length === 0) {
    return (
      <EmptyState
        icon="sunny-outline"
        title="Aún no hay rutinas"
        message="Anotar la rutina diaria ayuda a que cualquiera pueda apoyarte cuando lo necesites."
        actionLabel="Agregar rutinas"
        onAction={goEdit}
      />
    );
  }

  return (
    <Card>
      {person.rutinas.map((r, i) => (
        <View
          key={`${r.hora}-${i}`}
          accessible
          accessibilityLabel={`${r.hora}, ${r.descripcion}`}
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: i < person.rutinas.length - 1 ? 1 : 0,
            borderBottomColor: colors.border,
          }}>
          <AppText variant="label" color="primaryDark" style={{ minWidth: 56 }}>
            {r.hora}
          </AppText>
          <AppText style={{ flex: 1 }}>{r.descripcion}</AppText>
        </View>
      ))}
      <Button title="Editar rutinas" variant="ghost" icon="create-outline" onPress={goEdit} />
    </Card>
  );
}

function CommentsTab({ person }: { person: PersonaCuidada }) {
  if (!person.comentarios_adicionales) {
    return (
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title="Sin comentarios"
        message="Aquí puedes dejar notas importantes: gustos, contactos o cosas a tener en cuenta."
        actionLabel="Agregar comentario"
        onAction={() => router.push({ pathname: '/form/persona', params: { id: person.id } })}
      />
    );
  }
  return (
    <Card>
      <AppText>{person.comentarios_adicionales}</AppText>
    </Card>
  );
}
