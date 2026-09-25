import type { ComponentProps } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { DatePicker, Input, Select, TextArea, TimePicker, type SelectOption } from '@/components/ui';

/**
 * Conectores entre react-hook-form y los componentes UI.
 * Mantienen las pantallas cortas y sin repetir <Controller>.
 */

type Base<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

type InputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChangeText' | 'error'>;

export function FormInput<T extends FieldValues>({ control, name, ...rest }: Base<T> & InputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...rest}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type TextAreaProps = Omit<ComponentProps<typeof TextArea>, 'value' | 'onChangeText' | 'error'>;

export function FormTextArea<T extends FieldValues>({
  control,
  name,
  ...rest
}: Base<T> & TextAreaProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextArea
          {...rest}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type SelectProps<V extends string> = {
  label: string;
  options: SelectOption<V>[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
};

export function FormSelect<T extends FieldValues, V extends string>({
  control,
  name,
  ...rest
}: Base<T> & SelectProps<V>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select<V>
          {...rest}
          value={(field.value as V | null) ?? null}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type DateProps = {
  label: string;
  hint?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function FormDatePicker<T extends FieldValues>({ control, name, ...rest }: Base<T> & DateProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DatePicker
          {...rest}
          value={field.value as Date}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type TimeProps = {
  label: string;
  hint?: string;
  required?: boolean;
};

export function FormTimePicker<T extends FieldValues>({ control, name, ...rest }: Base<T> & TimeProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TimePicker
          {...rest}
          value={field.value as string}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
