import { Alert } from 'react-native';

import { ErrorState, Header, Screen, SkeletonList } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useProfile } from '@/features/profile/hooks/useProfile';

export default function ProfileScreen() {
  const { session } = useAuth();
  const profile = useProfile();

  return (
    <Screen>
      <Header title="Mi perfil" />
      {profile.isLoading ? (
        <SkeletonList />
      ) : profile.isError ? (
        <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />
      ) : (
        <ProfileForm
          key={profile.data?.updated_at}
          profile={profile.data ?? null}
          email={session?.user.email ?? ''}
          submitLabel="Guardar cambios"
          onSaved={() => Alert.alert('¡Listo!', 'Guardamos tus datos.')}
        />
      )}
    </Screen>
  );
}
