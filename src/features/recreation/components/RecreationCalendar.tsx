import { useMemo } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { addDays, startOfDay, toISODate } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { EventoRecreacion } from '@/types/database';

import { tipoEventoColor } from '../constants';

LocaleConfig.locales.es = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

type Props = {
  events: EventoRecreacion[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
  onMonthChange: (firstDayOfMonth: Date) => void;
};

type Dot = { key: string; color: string };
type Marked = Record<string, { dots: Dot[]; selected?: boolean; selectedColor?: string; selectedTextColor?: string }>;

export function RecreationCalendar({ events, selectedDate, onSelectDate, onMonthChange }: Props) {
  const theme = useTheme();
  const { colors } = theme;

  const marked = useMemo<Marked>(() => {
    const result: Marked = {};
    for (const event of events) {
      let day = startOfDay(new Date(event.fecha_inicio));
      const end = new Date(event.fecha_fin);
      // Un punto por tipo y día (máximo 62 días para eventos largos)
      for (let i = 0; day <= end && i < 62; i += 1, day = addDays(day, 1)) {
        const key = toISODate(day);
        const entry = result[key] ?? { dots: [] };
        if (!entry.dots.some((d) => d.key === event.tipo)) {
          entry.dots.push({ key: event.tipo, color: colors[tipoEventoColor[event.tipo]] });
        }
        result[key] = entry;
      }
    }
    result[selectedDate] = {
      ...(result[selectedDate] ?? { dots: [] }),
      selected: true,
      selectedColor: colors.primarySoft,
      selectedTextColor: colors.text,
    };
    return result;
  }, [events, selectedDate, colors]);

  return (
    <Calendar
      // Re-monta al cambiar de tema (la librería no reacciona a cambios de `theme`)
      key={theme.scheme}
      current={selectedDate}
      firstDay={1}
      markingType="multi-dot"
      markedDates={marked}
      onDayPress={(day) => onSelectDate(day.dateString)}
      onMonthChange={(m) => onMonthChange(new Date(m.year, m.month - 1, 1))}
      enableSwipeMonths
      accessibilityLabel="Calendario de recreación"
      style={{ borderRadius: theme.radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}
      theme={{
        calendarBackground: colors.surface,
        dayTextColor: colors.text,
        textSectionTitleColor: colors.textMuted,
        monthTextColor: colors.text,
        todayTextColor: colors.primaryDark,
        arrowColor: colors.primaryDark,
        textDisabledColor: colors.border,
        selectedDayBackgroundColor: colors.primarySoft,
        selectedDayTextColor: colors.text,
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 13,
        textMonthFontWeight: '700',
        textDayFontWeight: '500',
      }}
    />
  );
}
