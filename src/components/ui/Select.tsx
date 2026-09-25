import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { FieldWrapper, useFieldBoxStyle } from './FieldWrapper';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T | null) => void;
  placeholder?: string;
  /** Permite dejar el campo vacío (muestra la opción "Ninguna"). */
  allowEmpty?: boolean;
  emptyLabel?: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecciona una opción',
  allowEmpty = false,
  emptyLabel = 'Ninguna',
  error,
  hint,
  required,
}: Props<T>) {
  const theme = useTheme();
  const boxStyle = useFieldBoxStyle(Boolean(error));
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const choose = (next: T | null) => {
    onChange(next);
    setOpen(false);
  };

  const rows: { value: T | null; label: string }[] = allowEmpty
    ? [{ value: null, label: emptyLabel }, ...options]
    : options;

  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint="Abre la lista de opciones"
        style={[boxStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <AppText color={selected ? 'text' : 'textMuted'} style={{ flex: 1 }}>
          {selected?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={22} color={theme.colors.primaryDark} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <SafeAreaView
            edges={['bottom']}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              maxHeight: '75%',
              paddingTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.lg,
            }}>
            <AppText variant="subtitle" style={{ marginBottom: theme.spacing.sm }}>
              {label}
            </AppText>
            <FlatList
              data={rows}
              keyExtractor={(item) => item.value ?? '__empty__'}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => choose(item.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.label}
                    style={({ pressed }) => ({
                      minHeight: theme.touchTarget + 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radii.md,
                      backgroundColor: isSelected
                        ? theme.colors.primarySoft
                        : pressed
                          ? theme.colors.surfaceAlt
                          : 'transparent',
                    })}>
                    <AppText>{item.label}</AppText>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primaryDark} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
            <Button
              title="Cerrar"
              variant="ghost"
              onPress={() => setOpen(false)}
              style={{ marginVertical: theme.spacing.sm }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </FieldWrapper>
  );
}
