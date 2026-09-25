import { z } from 'zod';

import { emailField } from '@/lib/validation';

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailField,
    password: z.string().min(8, 'Usa al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Repite tu contraseña'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
