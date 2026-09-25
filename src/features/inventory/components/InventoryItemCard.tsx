import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText, Badge, Card } from '@/components/ui';
import { useIsCompact } from '@/lib/layout';
import { useTheme } from '@/theme';
import type { ItemInventario } from '@/types/database';

import { isLowStock, tipoInventarioIcons, tipoInventarioLabels } from '../constants';

type Props = {
  item: ItemInventario;
  personName?: string;
  onPress: () => void;
  onAdjust: (delta: number) => void;
};

export function InventoryItemCard({ item, personName, onPress, onAdjust }: Props) {
  const { colors, spacing } = useTheme();
  const compact = useIsCompact();
  const low = isLowStock(item);

  return (
    <Card
      tone={low ? 'warningSoft' : 'surface'}
      style={low ? { borderColor: colors.warning, borderWidth: 2 } : undefined}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.nombre}, ${item.cantidad} unidades${low ? ', stock bajo' : ''}`}
        accessibilityHint="Abre el ítem para editarlo"
        style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <Ionicons name={tipoInventarioIcons[item.tipo]} size={28} color={colors.primaryDark} />
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <AppText variant="subtitle">{item.nombre}</AppText>
          {item.descripcion ? (
            <AppText color="textMuted" numberOfLines={2}>
              {item.descripcion}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs }}>
            <Badge label={tipoInventarioLabels[item.tipo]} tone="neutral" />
            {personName ? <Badge label={personName} tone="primary" icon="person-outline" /> : null}
            {low ? <Badge label="Queda poco" tone="warning" icon="alert-circle-outline" /> : null}
          </View>
        </View>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: compact ? 'space-between' : 'flex-end',
          gap: compact ? spacing.xs : spacing.md,
          marginTop: spacing.md,
        }}>
        <StepButton
          icon="remove"
          label={`Restar una unidad de ${item.nombre}`}
          disabled={item.cantidad === 0}
          onPress={() => onAdjust(-1)}
        />
        <View style={{ minWidth: 48, alignItems: 'center' }} accessibilityLiveRegion="polite">
          <AppText variant="title">{item.cantidad}</AppText>
          <AppText variant="caption" color="textMuted">
            unidades
          </AppText>
        </View>
        <StepButton icon="add" label={`Sumar una unidad de ${item.nombre}`} onPress={() => onAdjust(1)} />
      </View>
    </Card>
  );
}

type StepProps = {
  icon: 'add' | 'remove';
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function StepButton({ icon, label, onPress, disabled }: StepProps) {
  const { colors, touchTarget } = useTheme();
  const size = touchTarget + 4;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.primary : colors.primarySoft,
        opacity: disabled ? 0.4 : 1,
      })}>
      <Ionicons name={icon} size={28} color={colors.primaryDark} />
    </Pressable>
  );
}
