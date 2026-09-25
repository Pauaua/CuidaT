import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { maxFontSizeMultiplier, useTheme } from '@/theme';

import { FieldWrapper, useFieldStyles } from './FieldWrapper';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, required, accessibilityLabel, ...rest },
  ref
) {
  const { colors } = useTheme();
  const fieldStyle = useFieldStyles(Boolean(error));

  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error}
        placeholderTextColor={colors.textMuted}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={fieldStyle}
        {...rest}
      />
    </FieldWrapper>
  );
});
