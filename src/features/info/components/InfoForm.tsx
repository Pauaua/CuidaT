import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormSelect, FormTextArea } from '@/components/form/ControlledFields';
import { AppText, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Informacion } from '@/types/database';

import { serviceTypeOptions } from '../constants';
import { useSaveInfo } from '../hooks/useInfos';
import { formToInfo, infoSchema, infoToForm, type InfoFormValues } from '../schema';

type Props = {
  info?: Informacion;
  onSaved: () => void;
};

export function InfoForm({ info, onSaved }: Props) {
  const { spacing } = useTheme();
  const save = useSaveInfo();

  const { control, handleSubmit } = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: infoToForm(info),
  });

  // Si el tipo guardado no está en la lista, igual se muestra como opción
  const options =
    info && !serviceTypeOptions.some((o) => o.value === info.tipo_servicio)
      ? [...serviceTypeOptions, { value: info.tipo_servicio, label: info.tipo_servicio }]
      : serviceTypeOptions;

  const onSubmit = handleSubmit((values) =>
    save.mutate({ id: info?.id, values: formToInfo(values) }, { onSuccess: onSaved })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormInput control={control} name="nombre" label="Nombre" required placeholder="Ej: CESFAM Los Aromos" />
        <FormSelect control={control} name="tipo_servicio" label="Tipo de servicio" options={options} required />
        <FormInput control={control} name="telefono" label="Teléfono" keyboardType="phone-pad" />
        <FormInput control={control} name="direccion" label="Dirección" />
        <FormTextArea control={control} name="descripcion" label="Descripción" rows={2} />
        <FormTextArea
          control={control}
          name="utilidad"
          label="¿Para qué me sirve?"
          placeholder="Ej: retiro de medicamentos el primer lunes del mes"
          rows={2}
        />
      </Card>
      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button title={info ? 'Guardar cambios' : 'Agregar servicio'} onPress={onSubmit} loading={save.isPending} fullWidth />
    </View>
  );
}
