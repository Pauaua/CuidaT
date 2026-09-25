import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormTimePicker,
} from '@/components/form/ControlledFields';
import { AppText, Button, Card, IconButton } from '@/components/ui';
import { useTheme } from '@/theme';
import type { PersonaCuidada } from '@/types/database';

import { nivelDependenciaOptions } from '../constants';
import { useSavePerson } from '../hooks/usePersons';
import { formToPerson, personSchema, personToForm, type PersonFormValues } from '../schema';

type Props = {
  person?: PersonaCuidada;
  onSaved: (person: PersonaCuidada) => void;
};

export function PersonForm({ person, onSaved }: Props) {
  const { colors, spacing } = useTheme();
  const save = useSavePerson();

  const { control, handleSubmit } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: personToForm(person),
  });
  const routines = useFieldArray({ control, name: 'rutinas' });

  const onSubmit = handleSubmit((values) =>
    save.mutate({ id: person?.id, values: formToPerson(values) }, { onSuccess: onSaved })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
          Datos personales
        </AppText>
        <FormInput control={control} name="nombre" label="Nombre" required />
        <FormInput control={control} name="edad" label="Edad" keyboardType="number-pad" />
        <FormInput control={control} name="telefono" label="Teléfono" keyboardType="phone-pad" />
        <FormInput control={control} name="direccion" label="Dirección" />
      </Card>

      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
          Salud y necesidades
        </AppText>
        <FormInput control={control} name="condicion_enfermedad" label="Condición o enfermedad" />
        <FormSelect
          control={control}
          name="nivel_dependencia"
          label="Nivel de dependencia"
          options={nivelDependenciaOptions}
          required
        />
        <FormTextArea
          control={control}
          name="necesidades_fisicas"
          label="Necesidades físicas"
          placeholder="Ej: ayuda para caminar, cambio de pañal…"
          rows={3}
        />
        <FormTextArea
          control={control}
          name="necesidades_mentales"
          label="Necesidades mentales o emocionales"
          placeholder="Ej: se desorienta en la tarde, le calma la música…"
          rows={3}
        />
      </Card>

      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
          Rutinas diarias
        </AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          Anota lo que se repite cada día, así cualquier persona que te reemplace sabrá qué hacer.
        </AppText>
        {routines.fields.map((field, index) => (
          <View
            key={field.id}
            style={{
              borderLeftWidth: 3,
              borderLeftColor: colors.primary,
              paddingLeft: spacing.sm,
              marginBottom: spacing.sm,
            }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <FormTimePicker control={control} name={`rutinas.${index}.hora`} label={`Rutina ${index + 1}`} />
              </View>
              <IconButton
                icon="trash-outline"
                tone="danger"
                accessibilityLabel={`Eliminar rutina ${index + 1}`}
                onPress={() => routines.remove(index)}
              />
            </View>
            <FormInput
              control={control}
              name={`rutinas.${index}.descripcion`}
              label="Actividad"
              placeholder="Ej: desayuno"
            />
          </View>
        ))}
        <Button
          title="Agregar rutina"
          icon="add"
          variant="secondary"
          onPress={() => routines.append({ hora: '08:00', descripcion: '' })}
        />
      </Card>

      <Card>
        <FormTextArea
          control={control}
          name="comentarios_adicionales"
          label="Comentarios adicionales"
          placeholder="Gustos, cosas que le molestan, contactos de familiares…"
          rows={5}
        />
      </Card>

      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button
        title={person ? 'Guardar cambios' : 'Agregar persona'}
        onPress={onSubmit}
        loading={save.isPending}
        fullWidth
      />
    </View>
  );
}
