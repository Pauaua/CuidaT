import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { dateToTime, formatShortDate, isSameDay } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { EventoRecreacion } from '@/types/database';

import { tipoEventoColor, tipoEventoIcons, tipoEventoLabels } from '../constants';

type Props = {
  event: EventoRecreacion;
  onPress: () => void;
};

export function formatEventRange(event: EventoRecreacion): string {
  const start = new Date(event.fecha_inicio);
  const end = new Date(event.fecha_fin);
  if (isSameDay(start, end)) return `${dateToTime(start)} – ${dateToTime(end)}`;
  return `${formatShortDate(start)} ${dateToTime(start)} – ${formatShortDate(end)} ${dateToTime(end)}`;
}

export function EventItem({ event, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const color = colors[tipoEventoColor[event.tipo]];

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${tipoEventoLabels[event.tipo]}: ${event.titulo}, ${formatEventRange(event)}`}
      accessibilityHint="Abre el evento para editarlo"
      style={{ borderLeftWidth: 6, borderLeftColor: color }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={tipoEventoIcons[event.tipo]} size={22} color={colors.textOnPastel} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label">{event.titulo}</AppText>
          <AppText variant="caption" color="textMuted">
            {tipoEventoLabels[event.tipo]} · {formatEventRange(event)}
          </AppText>
          {event.descripcion ? <AppText variant="caption">{event.descripcion}</AppText> : null}
        </View>
      </View>
    </Card>
  );
}
