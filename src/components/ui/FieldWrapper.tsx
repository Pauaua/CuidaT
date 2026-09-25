import type { ReactNode } from 'react';
import { View, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

type Props = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

/** Etiqueta + mensaje de error/ayuda comunes a todos los campos de formulario. */
export function FieldWrapper({ label, error, hint, required, children }: Props) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.xxs, marginBottom: spacing.md }}>
      <AppText variant="label">
        {label}
        {required ? <AppText variant="label" color="dangerText">{' *'}</AppText> : null}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" color="dangerText" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

/** Caja común de los campos (sirve para View/Pressable). */
export function useFieldBoxStyle(hasError: boolean) {
  const { colors, radii, spacing, touchTarget } = useTheme();
  return {
    minHeight: touchTarget + 4,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: hasError ? colors.dangerText : colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  };
}

/** Caja + tipografía, para TextInput. */
export function useFieldStyles(hasError: boolean): StyleProp<TextStyle> {
  const { colors, typography } = useTheme();
  const box = useFieldBoxStyle(hasError);
  return [box, typography.body, { color: colors.text }];
}
