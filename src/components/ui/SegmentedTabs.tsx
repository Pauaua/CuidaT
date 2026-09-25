import { Pressable, ScrollView } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

type Tab<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
};

/** Pestañas horizontales; hacen scroll si no caben (teléfonos pequeños). */
export function SegmentedTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  const { colors, radii, spacing, touchTarget } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={{
        gap: spacing.xs,
        padding: spacing.xxs,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.pill,
        flexGrow: 1,
      }}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            style={{
              flexGrow: 1,
              minHeight: touchTarget,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.pill,
              backgroundColor: selected ? colors.surface : 'transparent',
            }}>
            <AppText variant="label" color={selected ? 'primaryDark' : 'textMuted'}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
