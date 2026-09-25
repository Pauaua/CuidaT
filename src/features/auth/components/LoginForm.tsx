import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';

import { FormInput } from '@/components/form/ControlledFields';
import { AppText, Button } from '@/components/ui';
import { useTheme } from '@/theme';

import { usePasswordReset, useSignIn } from '../hooks/useAuthActions';
import { loginSchema, type LoginValues } from '../schemas';

export function LoginForm() {
  const { spacing } = useTheme();
  const signIn = useSignIn();
  const reset = usePasswordReset();

  const { control, handleSubmit, getValues } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onForgot = () => {
    const email = getValues('email').trim();
    if (!email) {
      Alert.alert('Escribe tu correo', 'Ingresa tu correo arriba y te enviaremos un enlace para recuperar tu contraseña.');
      return;
    }
    reset.mutate(email, {
      onSuccess: () => Alert.alert('Revisa tu correo', 'Te enviamos un enlace para crear una nueva contraseña.'),
      onError: (e) => Alert.alert('No pudimos enviar el correo', e.message),
    });
  };

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
        placeholder="tucorreo@ejemplo.cl"
      />
      <FormInput
        control={control}
        name="password"
        label="Contraseña"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />
      {signIn.error ? (
        <AppText color="dangerText" accessibilityRole="alert">
          {signIn.error.message}
        </AppText>
      ) : null}
      <Button
        title="Ingresar"
        onPress={handleSubmit((values) => signIn.mutate(values))}
        loading={signIn.isPending}
        fullWidth
      />
      <Button title="Olvidé mi contraseña" variant="ghost" onPress={onForgot} loading={reset.isPending} />
    </View>
  );
}
