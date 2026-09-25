import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge, Card } from '@/components/ui';
import { useIsCompact } from '@/lib/layout';
import { useTheme } from '@/theme';
import type { PersonaCuidada } from '@/types/database';

import { nivelDependenciaLabels, nivelDependenciaTones } from '../constants';

type Props = {
  person: PersonaCuidada;
  medicationCount: number;
  onPress: () => void;
};

export function PersonCard({ person, medicationCount, onPress }: Props) {
  const { colors, spacing } = useTheme();
  const compact = useIsCompact();
  const avatar = compact ? 44 : 56;
  const initial = person.nombre.trim().charAt(0).toUpperCase();

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${person.nombre}, ${nivelDependenciaLabels[person.nivel_dependencia]}`}
      accessibilityHint="Abre la ficha de cuidado">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? spacing.sm : spacing.md }}>
        <View
          style={{
            width: avatar,
            height: avatar,
            borderRadius: avatar / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primarySoft,
          }}>
          <AppText variant={compact ? 'subtitle' : 'title'} color="primaryDark">
            {initial}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <AppText variant="subtitle">{person.nombre}</AppText>
          {person.condicion_enfermedad ? (
            <AppText color="textMuted" numberOfLines={1}>
              {person.condicion_enfermedad}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs }}>
            <Badge
              label={nivelDependenciaLabels[person.nivel_dependencia]}
              tone={nivelDependenciaTones[person.nivel_dependencia]}
            />
            <Badge
              label={`${medicationCount} ${medicationCount === 1 ? 'medicamento' : 'medicamentos'}`}
              tone="secondary"
              icon="medkit-outline"
            />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </View>
    </Card>
  );
}
