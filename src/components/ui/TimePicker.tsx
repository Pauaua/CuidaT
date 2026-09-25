import { dateToTime, timeToDate } from '@/lib/dates';

import { DateTimeField } from './DateTimeField';

type Props = {
  label: string;
  /** Hora en formato HH:MM */
  value: string;
  onChange: (time: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function TimePicker({ value, onChange, ...rest }: Props) {
  return (
    <DateTimeField
      {...rest}
      mode="time"
      value={timeToDate(value)}
      displayValue={value}
      onChange={(date) => onChange(dateToTime(date))}
      webPlaceholder="HH:MM"
      parseWebValue={(text) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? timeToDate(text) : null)}
    />
  );
}
