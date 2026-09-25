import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextArea,
  FormTimePicker,
} from '@/components/form/ControlledFields';
import { AppText, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import type { EventoRecreacion } from '@/types/database';

import { tipoEventoOptions } from '../constants';
import { useSaveEvent } from '../hooks/useEvents';
import { eventSchema, eventToForm, formToEvent, type EventFormValues } from '../schema';

type Props = {
  event?: EventoRecreacion;
  initialDate: Date;
  onSaved: () => void;
};

export function EventForm({ event, initialDate, onSaved }: Props) {
  const { spacing } = useTheme();
  const save = useSaveEvent();

  const { control, handleSubmit } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventToForm(event, initialDate),
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate({ id: event?.id, values: formToEvent(values) }, { onSuccess: onSaved })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormInput control={control} name="titulo" label="¿Qué vas a hacer?" required placeholder="Ej: Caminata en el parque" />
        <FormSelect control={control} name="tipo" label="Tipo" options={tipoEventoOptions} required />
        <FormTextArea control={control} name="descripcion" label="Detalles" rows={2} />
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <View style={{ flexGrow: 1, flexBasis: 150 }}>
            <FormDatePicker control={control} name="fechaInicio" label="Empieza" />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 110 }}>
            <FormTimePicker control={control} name="horaInicio" label="Hora" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <View style={{ flexGrow: 1, flexBasis: 150 }}>
            <FormDatePicker control={control} name="fechaFin" label="Termina" />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 110 }}>
            <FormTimePicker control={control} name="horaFin" label="Hora" />
          </View>
        </View>
      </Card>
      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button title={event ? 'Guardar cambios' : 'Agendar'} onPress={onSubmit} loading={save.isPending} fullWidth />
    </View>
  );
}
