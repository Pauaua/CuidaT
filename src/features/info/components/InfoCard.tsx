import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText, Badge, Button, Card } from '@/components/ui';
import { callPhone, openInMaps } from '@/lib/linking';
import { useTheme } from '@/theme';
import type { Informacion } from '@/types/database';

import { serviceIcon } from '../constants';

type Props = {
  info: Informacion;
  onEdit: () => void;
};

export function InfoCard({ info, onEdit }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <Card onPress={onEdit} accessibilityLabel={`${info.nombre}, ${info.tipo_servicio}`} accessibilityHint="Abre para editar">
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.secondarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={serviceIcon(info.tipo_servicio)} size={24} color={colors.secondaryDark} />
        </View>
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <AppText variant="subtitle">{info.nombre}</AppText>
          <Badge label={info.tipo_servicio} tone="secondary" />
          {info.descripcion ? <AppText color="textMuted">{info.descripcion}</AppText> : null}
          {info.utilidad ? (
            <AppText variant="caption" color="textMuted">
              Para qué sirve: {info.utilidad}
            </AppText>
          ) : null}
          {info.direccion ? <AppText variant="caption">{info.direccion}</AppText> : null}
        </View>
      </View>
      {info.telefono || info.direccion ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
          {info.telefono ? (
            <Button
              title="Llamar"
              icon="call"
              onPress={() => callPhone(info.telefono ?? '')}
              accessibilityLabel={`Llamar a ${info.nombre}`}
              style={{ flexGrow: 1 }}
            />
          ) : null}
          {info.direccion ? (
            <Button
              title="Cómo llegar"
              icon="map"
              variant="secondary"
              onPress={() => openInMaps(info.direccion ?? '')}
              accessibilityLabel={`Abrir la dirección de ${info.nombre} en mapas`}
              style={{ flexGrow: 1 }}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
