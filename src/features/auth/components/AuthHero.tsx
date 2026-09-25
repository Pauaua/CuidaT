import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { useTheme } from '@/theme';

export function AuthHero({ subtitle }: { subtitle: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xl }}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 6,
          borderColor: colors.secondarySoft,
        }}>
        <Ionicons name="heart" size={44} color={colors.primaryDark} />
      </View>
      <AppText variant="display" align="center" accessibilityRole="header">
        {APP_CONFIG.name}
      </AppText>
      <AppText color="textMuted" align="center">
        {subtitle}
      </AppText>
    </View>
  );
}
