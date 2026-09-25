import type { ReactNode } from 'react';

import { ErrorState, Header, IconButton, Screen, SkeletonList } from '@/components/ui';

type Props = {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  children: ReactNode;
};

/** Pantalla modal estándar para crear/editar: encabezado, carga, error y eliminar. */
export function FormScreen({
  title,
  subtitle,
  isLoading,
  error,
  onRetry,
  onDelete,
  deleteLabel = 'Eliminar',
  children,
}: Props) {
  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title={title}
        subtitle={subtitle}
        showBack
        right={
          onDelete ? (
            <IconButton icon="trash-outline" tone="danger" accessibilityLabel={deleteLabel} onPress={onDelete} />
          ) : null
        }
      />
      {isLoading ? <SkeletonList /> : error ? <ErrorState message={error.message} onRetry={onRetry} /> : children}
    </Screen>
  );
}
