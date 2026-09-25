import { Ionicons } from '@expo/vector-icons';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, TextInput, View } from 'react-native';

import { APP_CONFIG } from '@/config/app';
import { maxFontSizeMultiplier, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { FieldWrapper, useFieldBoxStyle, useFieldStyles } from './FieldWrapper';

type Props = {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  displayValue: string;
  onChange: (date: Date) => void;
  /** Solo para web: convierte el texto escrito en fecha. */
  parseWebValue: (text: string) => Date | null;
  webPlaceholder: string;
  error?: string;
  hint?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

/** Campo de fecha u hora que abre el selector nativo de cada plataforma. */
export function DateTimeField({
  label,
  mode,
  value,
  displayValue,
  onChange,
  parseWebValue,
  webPlaceholder,
  error,
  hint,
  required,
  minimumDate,
  maximumDate,
}: Props) {
  const theme = useTheme();
  const fieldStyle = useFieldStyles(Boolean(error));
  const boxStyle = useFieldBoxStyle(Boolean(error));
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [webText, setWebText] = useState(displayValue);

  if (Platform.OS === 'web') {
    return (
      <FieldWrapper label={label} error={error} hint={hint} required={required}>
        <TextInput
          value={webText}
          placeholder={webPlaceholder}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={label}
          onChangeText={(text) => {
            setWebText(text);
            const parsed = parseWebValue(text);
            if (parsed) onChange(parsed);
          }}
          style={fieldStyle}
        />
      </FieldWrapper>
    );
  }

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: true,
        minimumDate,
        maximumDate,
        onValueChange: (_event, date) => onChange(date),
      });
      return;
    }
    setDraft(value);
    setIosOpen(true);
  };

  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayValue}`}
        accessibilityHint={mode === 'date' ? 'Abre el selector de fecha' : 'Abre el selector de hora'}
        style={[boxStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <AppText maxFontSizeMultiplier={maxFontSizeMultiplier}>{displayValue}</AppText>
        <Ionicons
          name={mode === 'date' ? 'calendar-outline' : 'time-outline'}
          size={22}
          color={theme.colors.primaryDark}
        />
      </Pressable>

      <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.overlay,
          }}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
              alignSelf: 'center',
              width: '100%',
              maxWidth: 480,
            }}>
            <AppText variant="subtitle">{label}</AppText>
            <RNDateTimePicker
              value={draft}
              mode={mode}
              display={mode === 'date' ? 'inline' : 'spinner'}
              locale={APP_CONFIG.locale}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={theme.scheme}
              accentColor={theme.colors.primaryDark}
              onValueChange={(_event, date) => setDraft(date)}
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
              <Button title="Cancelar" variant="ghost" onPress={() => setIosOpen(false)} />
              <Button
                title="Listo"
                onPress={() => {
                  onChange(draft);
                  setIosOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </FieldWrapper>
  );
}
