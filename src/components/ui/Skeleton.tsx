import { useEffect, useState } from 'react';
import { Animated, View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

export function Skeleton({ width = '100%', height = 18, radius }: Props) {
  const { colors, radii } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: radius ?? radii.sm,
        backgroundColor: colors.skeleton,
        opacity,
      }}
    />
  );
}

/** Lista de tarjetas "fantasma" mientras cargan los datos. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View
      accessibilityLabel="Cargando información"
      accessibilityRole="progressbar"
      style={{ gap: spacing.md }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Skeleton width="55%" height={22} />
          <Skeleton width="85%" />
          <Skeleton width="40%" />
        </View>
      ))}
    </View>
  );
}
