import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/form/ControlledFields';
import { AppText, Button, Card, Chip } from '@/components/ui';
import { usePersons } from '@/features/care/hooks/usePersons';
import { unitsLabel } from '@/features/inventory/constants';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { useMedications } from '@/features/medications/hooks/useMedications';
import { useSettings } from '@/features/settings/hooks/SettingsProvider';
import { useTheme } from '@/theme';
import type { CategoriaGasto, Gasto } from '@/types/database';

import { useExpenses, useExpenseSummary, useSaveExpense } from '../hooks/useExpenses';
import {
  DESTINO_NINGUNO,
  DESTINO_NUEVO,
  expenseSchema,
  expenseToForm,
  formToExpense,
  type ExpenseFormValues,
} from '../schema';

type Props = {
  categoria: CategoriaGasto;
  expense?: Gasto;
  onSaved: () => void;
};

/** Sugerencia de nombre: viene de un medicamento o de un ítem del inventario. */
type NameSuggestion = {
  label: string;
  inventarioId: string | null;
  medicamentoId: string | null;
};

export function ExpenseForm({ categoria, expense, onSaved }: Props) {
  const { spacing } = useTheme();
  const { settings } = useSettings();
  const save = useSaveExpense();
  const persons = usePersons();
  const medications = useMedications();
  const inventory = useInventory();
  const history = useExpenses(categoria);
  const { lugares } = useExpenseSummary(history.data);
  const isMedication = categoria === 'medicamento';
  const isEditing = Boolean(expense);

  const { control, handleSubmit, setValue } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expenseToForm(expense, categoria, settings.lowStockThreshold),
  });
  const destino = useWatch({ control, name: 'destino' });
  const cantidad = useWatch({ control, name: 'cantidad' });

  // Ítems del inventario que tienen sentido para esta categoría
  const relevantItems = (inventory.data ?? []).filter(
    (i) =>
      (isMedication ? i.tipo === 'medicamento' : i.tipo !== 'medicamento') ||
      i.id === expense?.inventario_id
  );

  // Sugerencias de nombre: medicamentos guardados e ítems del inventario
  const nameSuggestions = uniqueByLabel([
    ...(isMedication
      ? (medications.data ?? []).map((m) => ({
          label: m.nombre,
          inventarioId: m.inventario_id,
          medicamentoId: m.id,
        }))
      : []),
    ...relevantItems.map((i) => ({ label: i.nombre, inventarioId: i.id, medicamentoId: null })),
  ]).slice(0, 8);

  const set = (field: 'nombre' | 'lugar' | 'destino', value: string) =>
    setValue(field, value, { shouldValidate: true, shouldDirty: true });

  const pickName = (s: NameSuggestion) => {
    set('nombre', s.label);
    if (isEditing) return;
    // Suma al stock que ya existe; si no hay, crea uno nuevo
    set('destino', s.inventarioId ?? DESTINO_NUEVO);
    // Medicamento sin stock vinculado: al guardar lo vinculamos al ítem
    setValue('medicamento_id', s.medicamentoId && !s.inventarioId ? s.medicamentoId : null);
  };

  const destinoOptions = [
    ...(isEditing ? [] : [{ value: DESTINO_NUEVO, label: 'Crear ítem nuevo en Inventario' }]),
    ...relevantItems.map((i) => ({ value: i.id, label: `${i.nombre} (hoy ${unitsLabel(i.cantidad)})` })),
    { value: DESTINO_NINGUNO, label: 'No sumar al inventario' },
  ];

  const unidades = Number.parseInt(cantidad, 10) || 0;
  const destinoHint =
    destino === DESTINO_NINGUNO
      ? 'Solo se registrará el gasto.'
      : destino === DESTINO_NUEVO
        ? `Se creará en Inventario con ${unitsLabel(unidades)}.`
        : `Se sumarán ${unitsLabel(unidades)} a este ítem.${
            isMedication ? ' Cada toma marcada como dada las irá descontando.' : ''
          }`;

  const onSubmit = handleSubmit((values) =>
    save.mutate({ id: expense?.id, submission: formToExpense(values) }, { onSuccess: onSaved })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <FormInput
          control={control}
          name="nombre"
          label={isMedication ? 'Medicamento' : '¿Qué compraste?'}
          required
          placeholder={isMedication ? 'Ej: Losartán 50 mg' : 'Ej: Pañales talla M'}
        />
        <Suggestions
          items={nameSuggestions.map((s) => s.label)}
          onPick={(label) => {
            const suggestion = nameSuggestions.find((s) => s.label === label);
            if (suggestion) pickName(suggestion);
          }}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <View style={{ flexGrow: 1, flexBasis: 120 }}>
            <FormInput
              control={control}
              name="cantidad"
              label={isMedication ? 'Cantidad comprada' : 'Unidades'}
              required
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flexGrow: 2, flexBasis: 150 }}>
            <FormInput
              control={control}
              name="precio"
              label="Precio total ($)"
              required
              keyboardType="number-pad"
              placeholder="Ej: 12990"
            />
          </View>
        </View>
        <AppText variant="caption" color="textMuted" style={{ marginTop: -spacing.xs, marginBottom: spacing.md }}>
          {isMedication
            ? 'Escribe el total de pastillas o comprimidos. Ej: si compraste 1 caja de 30, escribe 30.'
            : 'Con las unidades calculamos el precio de cada una, para comparar entre lugares.'}
        </AppText>

        <FormInput
          control={control}
          name="lugar"
          label={isMedication ? 'Farmacia' : 'Lugar o tienda'}
          placeholder={isMedication ? 'Ej: farmacia del barrio' : 'Ej: supermercado'}
        />
        <Suggestions items={lugares.slice(0, 6)} onPick={(v) => set('lugar', v)} />
      </Card>

      <Card tone="secondarySoft">
        <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
          Sumar al inventario
        </AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          Lo que compras entra a tu inventario, así siempre sabes cuánto te queda.
        </AppText>
        <FormSelect
          control={control}
          name="destino"
          label="¿Dónde lo guardamos?"
          options={destinoOptions}
          hint={destinoHint}
        />
        {destino === DESTINO_NUEVO ? (
          <FormInput
            control={control}
            name="umbral_bajo"
            label="Avisarme cuando queden"
            hint="Te mostraremos una alerta cuando el stock llegue a este número."
            keyboardType="number-pad"
          />
        ) : null}
      </Card>

      <Card>
        <FormDatePicker control={control} name="fecha" label="Fecha de compra" maximumDate={new Date()} />
        <FormSelect
          control={control}
          name="persona_cuidada_id"
          label="¿Para quién?"
          options={(persons.data ?? []).map((p) => ({ value: p.id, label: p.nombre }))}
          allowEmpty
          emptyLabel="General"
          placeholder="General"
        />
        <FormTextArea control={control} name="notas" label="Notas" rows={2} placeholder="Ej: tenía descuento con receta" />
      </Card>

      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button title={expense ? 'Guardar cambios' : 'Guardar compra'} onPress={onSubmit} loading={save.isPending} fullWidth />
    </View>
  );
}

function uniqueByLabel(values: NameSuggestion[]): NameSuggestion[] {
  const seen = new Set<string>();
  return values.filter((v) => {
    const key = v.label.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Fila de chips con valores usados antes, para completar con un toque. */
function Suggestions({ items, onPick }: { items: string[]; onPick: (value: string) => void }) {
  const { spacing } = useTheme();
  if (items.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.md, marginTop: -spacing.xs }}>
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          selected={false}
          onPress={() => onPick(item)}
          accessibilityLabel={`Usar ${item}`}
        />
      ))}
    </ScrollView>
  );
}
