import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, EmptyState, ErrorState, Screen, SkeletonList } from '@/components/ui';
import { LowStockAlerts } from '@/features/inventory/components/LowStockAlerts';
import { DoseItem } from '@/features/medications/components/DoseItem';
import { useMarkDoseGiven, useTodayDoses } from '@/features/medications/hooks/useTodayDoses';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { WellbeingCard } from '@/features/recreation/components/WellbeingCard';
import { capitalize, formatLongDate, greetingForHour } from '@/lib/dates';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { spacing } = useTheme();
  const profile = useProfile();
  const firstName = profile.data?.nombre.split(' ')[0] ?? '';
  const [refreshing, setRefreshing] = useState(false);
  const today = useTodayDoses();

  const onRefresh = async () => {
    setRefreshing(true);
    await today.refetch();
    setRefreshing(false);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={{ paddingVertical: spacing.lg, gap: spacing.xxs }}>
        <AppText color="textMuted">{capitalize(formatLongDate(new Date()))}</AppText>
        <AppText variant="display" accessibilityRole="header">
          {greetingForHour()}, {firstName} 💜
        </AppText>
      </View>

      <View style={{ gap: spacing.lg }}>
        <WellbeingCard interests={profile.data?.recreacion} />
        <TodayDosesSection {...today} />
        <LowStockAlerts />
      </View>
    </Screen>
  );
}

function TodayDosesSection({ doses, isLoading, isError, refetch }: ReturnType<typeof useTodayDoses>) {
  const { spacing } = useTheme();
  const markGiven = useMarkDoseGiven();
  const remaining = doses.filter((d) => !d.given).length;

  return (
    <Card>
      <AppText variant="subtitle" accessibilityRole="header">
        Medicamentos de hoy
      </AppText>
      {doses.length > 0 ? (
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          {remaining === 0 ? '¡Listo! Todas las tomas de hoy están registradas.' : `Quedan ${remaining} por dar.`}
        </AppText>
      ) : null}

      {isLoading ? (
        <SkeletonList count={2} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : doses.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title="No hay tomas para hoy"
          message="Cuando agregues medicamentos en Cuidado, verás aquí las tomas del día."
          actionLabel="Ir a Cuidado"
          onAction={() => router.navigate('/cuidado')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {doses.map((dose) => (
            <DoseItem
              key={dose.key}
              dose={dose}
              loading={markGiven.isPending && markGiven.variables?.key === dose.key}
              onMarkGiven={() => markGiven.mutate(dose)}
            />
          ))}
          {markGiven.error ? (
            <AppText color="dangerText" accessibilityRole="alert">
              {markGiven.error.message}
            </AppText>
          ) : null}
        </View>
      )}
      {!isLoading && doses.length > 0 ? (
        <Button
          title="Ver historial"
          variant="ghost"
          icon="time-outline"
          onPress={() => router.navigate('/registros')}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </Card>
  );
}
