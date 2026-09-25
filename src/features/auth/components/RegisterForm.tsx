import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';

import { FormInput } from '@/components/form/ControlledFields';
import { AppText, Button } from '@/components/ui';
import { useTheme } from '@/theme';

import { useSignUp } from '../hooks/useAuthActions';
import { registerSchema, type RegisterValues } from '../schemas';

export function RegisterForm() {
  const { spacing } = useTheme();
  const signUp = useSignUp();

  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(({ email, password }) =>
    signUp.mutate(
      { email, password },
      {
        onSuccess: ({ needsConfirmation }) => {
          if (needsConfirmation) {
            Alert.alert(
              '¡Casi listo!',
              'Te enviamos un correo para confirmar tu cuenta. Después vuelve aquí e ingresa.',
              [{ text: 'Entendido', onPress: () => router.replace('/login') }]
            );
          }
        },
      }
    )
  );

  return (
    <View style={{ gap: spacing.xs }}>
      <FormInput
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormInput
        control={control}
        name="password"
        label="Contraseña"
        hint="Mínimo 8 caracteres"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Repite tu contraseña"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {signUp.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {signUp.error.message}
        </AppText>
      ) : null}
      <Button title="Crear mi cuenta" onPress={onSubmit} loading={signUp.isPending} fullWidth />
    </View>
  );
}
