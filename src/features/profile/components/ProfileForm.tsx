import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput, FormTextArea } from '@/components/form/ControlledFields';
import { AppText, Button, Card } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Usuario } from '@/types/database';

import { useSaveProfile } from '../hooks/useProfile';
import { formToProfile, profileSchema, profileToForm, type ProfileFormValues } from '../schema';

type Props = {
  profile: Usuario | null;
  email: string;
  submitLabel: string;
  onSaved?: () => void;
};

export function ProfileForm({ profile, email, submitLabel, onSaved }: Props) {
  const { spacing } = useTheme();
  const save = useSaveProfile();

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileToForm(profile, email),
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate({ values: formToProfile(values), id: profile?.id }, { onSuccess: () => onSaved?.() })
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
          Sobre ti
        </AppText>
        <FormInput control={control} name="nombre" label="¿Cómo te llamas?" required autoComplete="name" />
        <FormInput control={control} name="edad" label="Edad" keyboardType="number-pad" />
        <FormInput control={control} name="telefono" label="Teléfono" keyboardType="phone-pad" autoComplete="tel" />
        <FormInput
          control={control}
          name="correo"
          label="Correo"
          required
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput control={control} name="direccion" label="Dirección" autoComplete="street-address" />
      </Card>

      <Card>
        <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
          Tu salud
        </AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          Esta información es solo tuya y nos ayuda a acompañarte mejor.
        </AppText>
        <FormTextArea
          control={control}
          name="condicion_fisica"
          label="Condición física"
          placeholder="Ej: dolor de espalda, cansancio frecuente…"
          rows={3}
        />
        <FormTextArea
          control={control}
          name="perfil_salud"
          label="Perfil de salud"
          placeholder="Ej: controles médicos, alergias…"
          rows={3}
        />
      </Card>

      <Card tone="secondarySoft">
        <AppText variant="subtitle" style={{ marginBottom: spacing.xs }}>
          Lo que te hace bien
        </AppText>
        <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
          Cuéntanos qué te gusta hacer. Te lo recordaremos cuando necesites un respiro.
        </AppText>
        <FormTextArea
          control={control}
          name="recreacion"
          label="Intereses y actividades"
          placeholder="Ej: caminar, tejer, juntarme con amigas, ver series…"
          rows={3}
        />
      </Card>

      {save.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {save.error.message}
        </AppText>
      ) : null}
      <Button title={submitLabel} onPress={onSubmit} loading={save.isPending} fullWidth />
    </View>
  );
}
