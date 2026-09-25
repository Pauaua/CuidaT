import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ErrorState, FAB, Header, Screen, SkeletonList } from '@/components/ui';
import { InfoCard } from '@/features/info/components/InfoCard';
import { useInfos } from '@/features/info/hooks/useInfos';
import { useContentWidth } from '@/lib/layout';
import { useTheme } from '@/theme';

export default function InfosScreen() {
  const { spacing } = useTheme();
  const twoColumns = useContentWidth() >= 640;
  const infos = useInfos();

  const openForm = (id?: string) => router.push({ pathname: '/form/informacion', params: id ? { id } : {} });

  return (
    <Screen
      refreshing={infos.isRefetching}
      onRefresh={() => infos.refetch()}
      overlay={<FAB onPress={() => openForm()} accessibilityLabel="Agregar servicio útil" />}>
      <Header title="Servicios útiles" subtitle="Tus contactos a mano" />

      {infos.isLoading ? (
        <SkeletonList />
      ) : infos.isError ? (
        <ErrorState message={infos.error.message} onRetry={() => infos.refetch()} />
      ) : !infos.data || infos.data.length === 0 ? (
        <EmptyState
          icon="call-outline"
          title="Aún no hay servicios"
          message="Guarda el CESFAM, la farmacia o la urgencia más cercana para llamar o llegar con un toque."
          actionLabel="Agregar servicio"
          onAction={() => openForm()}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {infos.data.map((info) => (
            <View key={info.id} style={{ width: twoColumns ? '48.5%' : '100%' }}>
              <InfoCard info={info} onEdit={() => openForm(info.id)} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
