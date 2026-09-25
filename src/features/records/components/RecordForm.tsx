import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  FormDatePicker,
  FormSelect,
  FormTextArea,
  FormTimePicker,
} from '@/components/form/ControlledFields';
import { AppText, Button, Card } from '@/components/ui';
import { usePersons } from '@/features/care/hooks/usePersons';
import { dateToTime } from '@/lib/dates';
import { useTheme } from '@/theme';

import { manualRecordOptions } from '../constants';
import { useCreateRecord } from '../hooks/useRecords';
import { formToRecord, recordSchema, type RecordFormValues } from '../schema';

export function RecordForm({ onSaved }: { onSaved: () => void }) {
  const { spacing } = useTheme();
  const persons = usePersons();
  const create = useCreateRecord();
  const now = new Date();

  const { control, handleSubmit } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      tipo: 'nota',
      descripcion: '',
      persona_cuidada_id: persons.data?.length === 1 ? (persons.data[0]?.id ?? null) : null,
      fecha: now,
      hora: dateToTime(now),
    },
  });

  const onSubmit = handleSubmit((values) => create.mutate(formToRecord(values), { onSuccess: onSaved }));

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormSelect control={control} name="tipo" label="¿Qué quieres registrar?" options={manualRecordOptions} required />
        <FormTextArea
          control={control}
          name="descripcion"
          label="Descripción"
          required
          placeholder="Ej: Hoy durmió bien la siesta y comió todo el almuerzo."
          rows={4}
        />
        <FormSelect
          control={control}
          name="persona_cuidada_id"
          label="Persona"
          options={(persons.data ?? []).map((p) => ({ value: p.id, label: p.nombre }))}
          allowEmpty
          emptyLabel="General"
          placeholder="General"
        />
        <FormDatePicker control={control} name="fecha" label="Fecha" maximumDate={now} />
        <FormTimePicker control={control} name="hora" label="Hora" />
      </Card>
      {create.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {create.error.message}
        </AppText>
      ) : null}
      <Button title="Guardar registro" onPress={onSubmit} loading={create.isPending} fullWidth />
    </View>
  );
}
