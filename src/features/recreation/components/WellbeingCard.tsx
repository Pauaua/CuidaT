import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Skeleton } from '@/components/ui';
import { capitalize, formatLongDate } from '@/lib/dates';
import { useTheme } from '@/theme';

import { tipoEventoLabels } from '../constants';
import { useNextFreeActivity } from '../hooks/useEvents';
import { pickInvitation } from '../messages';
import { formatEventRange } from './EventItem';

/** Tarjeta destacada del inicio: el bienestar de quien cuida. */
export function WellbeingCard({ interests }: { interests?: string | null }) {
  const { colors, radii, spacing } = useTheme();
  const { next, isLoading } = useNextFreeActivity();

  if (isLoading) return <Skeleton height={170} radius={radii.lg} />;

  return (
    <Card tone="primarySoft" style={{ borderColor: colors.primary, borderWidth: 1.5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
        <Ionicons name="sparkles" size={24} color={colors.primaryDark} />
        <AppText variant="subtitle" color="primaryDark">
          Tu momento
        </AppText>
      </View>

      {next ? (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge">Tu próxima actividad libre es:</AppText>
          <AppText variant="title">{next.titulo}</AppText>
          <AppText color="textMuted">
            {tipoEventoLabels[next.tipo]} · {capitalize(formatLongDate(new Date(next.fecha_inicio)))},{' '}
            {formatEventRange(next)}
          </AppText>
          <AppText style={{ marginTop: spacing.xs }}>¡Disfrútala! Te la mereces.</AppText>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge">{pickInvitation()}</AppText>
          {interests ? (
            <AppText color="textMuted">Nos contaste que te gusta: {interests}</AppText>
          ) : null}
          <Button
            title="Agendar un momento para mí"
            icon="calendar"
            onPress={() => router.push('/form/evento')}
          />
        </View>
      )}
    </Card>
  );
}
