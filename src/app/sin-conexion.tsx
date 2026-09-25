import { ErrorState, Screen } from '@/components/ui';
import { useProfile } from '@/features/profile/hooks/useProfile';

export default function ConnectionErrorScreen() {
  const profile = useProfile();
  return (
    <Screen>
      <ErrorState
        message="No pudimos cargar tu perfil. Revisa tu conexión a internet e inténtalo de nuevo."
        onRetry={() => profile.refetch()}
      />
    </Screen>
  );
}
