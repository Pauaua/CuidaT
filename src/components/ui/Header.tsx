import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useIsCompact } from '@/lib/layout';
import { useTheme } from '@/theme';

import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
};

export function Header({ title, subtitle, showBack = false, onBack, right }: Props) {
  const { colors, spacing, touchTarget } = useTheme();
  const compact = useIsCompact();

  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  const backButton = showBack ? (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      style={({ pressed }) => ({
        width: touchTarget,
        height: touchTarget,
        borderRadius: touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.primarySoft : colors.surfaceAlt,
      })}>
      <Ionicons name="chevron-back" size={26} color={colors.primaryDark} />
    </Pressable>
  ) : null;

  const titleBlock = (
    <View style={{ flex: 1 }}>
      <AppText variant="title" accessibilityRole="header" numberOfLines={compact ? 3 : 2}>
        {title}
      </AppText>
      {subtitle ? <AppText color="textMuted">{subtitle}</AppText> : null}
    </View>
  );

  // En espacios angostos, botones arriba y título completo debajo
  if (compact && (backButton || right)) {
    return (
      <View style={{ gap: spacing.sm, paddingVertical: spacing.sm, marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {backButton ?? <View />}
          {right}
        </View>
        {titleBlock}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
      }}>
      {backButton}
      {titleBlock}
      {right}
    </View>
  );
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
};

export function IconButton({ icon, accessibilityLabel, onPress, tone = 'primary' }: IconButtonProps) {
  const { colors, touchTarget } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: touchTarget,
        height: touchTarget,
        borderRadius: touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed
          ? tone === 'danger'
            ? colors.danger
            : colors.primarySoft
          : tone === 'danger'
            ? colors.dangerSoft
            : colors.surfaceAlt,
      })}>
      <Ionicons name={icon} size={24} color={tone === 'danger' ? colors.dangerText : colors.primaryDark} />
    </Pressable>
  );
}
