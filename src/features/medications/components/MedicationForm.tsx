import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormTextArea, FormTimePicker } from '@/components/form/ControlledFields';
import { AppText, Button, Card, IconButton } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Medicamento } from '@/types/database';

import { useSaveMedication } from '../hooks/useMedications';
import {
  formToMedication,
  medicationSchema,
  medicationToForm,
  type MedicationFormValues,
} from '../schema';

type Props = {
  personId: string;
  personName: string;
  medication?: Medicamento;
  onSaved: () => void;
};

export function MedicationForm({ personId, personName, medication, onSaved }: Props) {
  const { spacing } = useTheme();
  const save = useSaveMedication();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: medicationToForm(medication),
  });
  const times = useFieldArray({ control, name: 'horas_toma' });

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      { id: medication?.id, values: formToMedication(values, personId), personName },
      { onSuccess: onSaved }
    )
  );

  const timesError = errors.horas_toma?.message ?? errors.horas_toma?.root?.message;

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormInput control={control} name="nombre" label="Nombre del medicamento" required />
        <FormInput control={control} name="dosis" label="Dosis" required placeholder="Ej: 1 comprimido de 50 mg" />
        <FormInput control={control} name="laboratorio" label="Laboratorio" />
        <FormTextArea
          control={control}
          name="indicaciones_especiales"
          label="Indicaciones especiales"
          placeholder="Ej: tomar con comida, no partir…"
          rows={3}
        />
      </Card>

      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
          Horas de toma
        </AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          Te avisaremos a cada hora con una notificación.
        </AppText>
        {times.fields.map((field, index) => (
          <View key={field.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <FormTimePicker control={control} name={`horas_toma.${index}.hora`} label={`Toma ${index + 1}`} />
            </View>
            {times.fields.length > 1 ? (
              <IconButton
                icon="trash-outline"
                tone="danger"
                accessibilityLabel={`Eliminar toma ${index + 1}`}
                onPress={() => times.remove(index)}
              />
            ) : null}
          </View>
        ))}
        {timesError ? (
          <AppText variant="caption" color="dangerText" style={{ marginBottom: spacing.sm }}>
            {timesError}
          </AppText>
        ) : null}
        <Button
          title="Agregar otra hora"
          icon="add"
          variant="secondary"
          onPress={() => times.append({ hora: '20:00' })}
        />
      </Card>

      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button
        title={medication ? 'Guardar cambios' : 'Agregar medicamento'}
        onPress={onSubmit}
        loading={save.isPending}
        fullWidth
      />
    </View>
  );
}
