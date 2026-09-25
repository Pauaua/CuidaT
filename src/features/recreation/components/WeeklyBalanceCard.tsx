import { View } from 'react-native';

import { AppText, Card, Skeleton } from '@/components/ui';
import { useTheme } from '@/theme';

import { useWeeklyBalance } from '../hooks/useEvents';
import { weeklyBalanceMessage } from '../messages';

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded.toLocaleString('es-CL')} h`;
}

export function WeeklyBalanceCard() {
  const { colors, radii, spacing } = useTheme();
  const { balance, isLoading, isError } = useWeeklyBalance();

  if (isLoading) return <Skeleton height={150} radius={radii.lg} />;
  if (isError) return null;

  const total = balance.freeHours + balance.careHours;
  const freeShare = total === 0 ? 0 : balance.freeHours / total;

  return (
    <Card tone="secondarySoft">
      <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
        Tu semana
      </AppText>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <Stat label="Tiempo para ti" value={formatHours(balance.freeHours)} dot={colors.eventFreeDay} />
        <Stat label="Tiempo cuidando" value={formatHours(balance.careHours)} dot={colors.eventCare} />
      </View>

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${Math.round(freeShare * 100)} por ciento de tu tiempo agendado es para ti`}
        style={{
          height: 14,
          borderRadius: radii.pill,
          backgroundColor: total === 0 ? colors.surfaceAlt : colors.eventCare,
          overflow: 'hidden',
          marginBottom: spacing.md,
        }}>
        <View style={{ width: `${freeShare * 100}%`, height: '100%', backgroundColor: colors.eventFreeDay }} />
      </View>

      <AppText>{weeklyBalanceMessage(balance.freeHours, balance.careHours)}</AppText>
    </Card>
  );
}

function Stat({ label, value, dot }: { label: string; value: string; dot: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing.xxs }} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dot }} />
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
      </View>
      <AppText variant="title">{value}</AppText>
    </View>
  );
}
