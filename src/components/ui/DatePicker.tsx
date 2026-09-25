import { formatShortDate, fromISODate } from '@/lib/dates';

import { DateTimeField } from './DateTimeField';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DatePicker(props: Props) {
  return (
    <DateTimeField
      {...props}
      mode="date"
      displayValue={formatShortDate(props.value)}
      webPlaceholder="AAAA-MM-DD"
      parseWebValue={(text) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
        // Conserva la hora que ya tenía el valor
        const date = fromISODate(text);
        date.setHours(props.value.getHours(), props.value.getMinutes(), 0, 0);
        return date;
      }}
    />
  );
}
