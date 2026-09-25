import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormSelect, FormTextArea } from '@/components/form/ControlledFields';
import { AppText, Button, Card } from '@/components/ui';
import { usePersons } from '@/features/care/hooks/usePersons';
import { useSettings } from '@/features/settings/hooks/SettingsProvider';
import { useTheme } from '@/theme';
import type { ItemInventario } from '@/types/database';

import { tipoInventarioOptions } from '../constants';
import { useSaveInventoryItem } from '../hooks/useInventory';
import { formToItem, inventorySchema, itemToForm, type InventoryFormValues } from '../schema';

type Props = {
  item?: ItemInventario;
  onSaved: () => void;
};

export function InventoryForm({ item, onSaved }: Props) {
  const { spacing } = useTheme();
  const { settings } = useSettings();
  const persons = usePersons();
  const save = useSaveInventoryItem();

  const { control, handleSubmit } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: itemToForm(item, settings.lowStockThreshold),
  });

  const personOptions = (persons.data ?? []).map((p) => ({ value: p.id, label: p.nombre }));

  const onSubmit = handleSubmit((values) =>
    save.mutate({ id: item?.id, values: formToItem(values) }, { onSuccess: onSaved })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormInput control={control} name="nombre" label="Nombre" required placeholder="Ej: Pañales talla M" />
        <FormSelect control={control} name="tipo" label="Tipo" options={tipoInventarioOptions} required />
        <FormTextArea control={control} name="descripcion" label="Descripción" rows={2} />
        <FormSelect
          control={control}
          name="persona_cuidada_id"
          label="¿Para quién es?"
          options={personOptions}
          allowEmpty
          emptyLabel="Uso general"
          placeholder="Uso general"
        />
      </Card>
      <Card>
        <FormInput control={control} name="cantidad" label="Cantidad (unidades)" required keyboardType="number-pad" />
        <FormInput
          control={control}
          name="umbral_bajo"
          label="Avisarme cuando queden"
          hint="Te mostraremos una alerta cuando la cantidad llegue a este número o menos."
          required
          keyboardType="number-pad"
        />
      </Card>
      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button title={item ? 'Guardar cambios' : 'Agregar al inventario'} onPress={onSubmit} loading={save.isPending} fullWidth />
    </View>
  );
}
