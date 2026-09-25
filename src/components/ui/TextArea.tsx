import { TextInput } from 'react-native';

import { maxFontSizeMultiplier, useTheme } from '@/theme';

import { FieldWrapper, useFieldStyles } from './FieldWrapper';
import type { InputProps } from './Input';

type Props = InputProps & { rows?: number };

export function TextArea({ label, error, hint, required, rows = 4, accessibilityLabel, ...rest }: Props) {
  const { colors, typography } = useTheme();
  const fieldStyle = useFieldStyles(Boolean(error));
  const lineHeight = typography.body.lineHeight ?? 24;

  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <TextInput
        multiline
        textAlignVertical="top"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error}
        placeholderTextColor={colors.textMuted}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[fieldStyle, { minHeight: lineHeight * rows + 24 }]}
        {...rest}
      />
    </FieldWrapper>
  );
}
