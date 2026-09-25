import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { confirmAction } from '@/lib/confirm';
import { getSidebarWidth, isPermanentSidebar, SIDEBAR_PANEL_WIDTH } from '@/lib/layout';
import { useTheme } from '@/theme';

import { navItems, navSections, type NavItem } from './navItems';

/**
 * Barra lateral izquierda:
 * - Teléfonos: franja de íconos siempre visible; ☰ abre un panel con los nombres.
 * - Tablets: panel con nombres siempre abierto.
 */
export function SideRail({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const permanent = isPermanentSidebar(width);
  const railWidth = getSidebarWidth(width);
  const [open, setOpen] = useState(false);
  const signOut = useSignOut();

  const activeRoute = state.routes[state.index]?.name;

  const go = (route: string) => {
    setOpen(false);
    navigation.navigate(route);
  };

  const onSignOut = () => {
    setOpen(false);
    confirmAction(
      '¿Cerrar sesión?',
      'Tus datos quedan guardados en tu cuenta.',
      () => signOut.mutate(),
      'Cerrar sesión'
    );
  };

  const container = {
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
  };

  if (permanent) {
    return (
      <View style={[container, { width: railWidth + insets.left }]}>
        <ExpandedMenu activeRoute={activeRoute} onSelect={go} onSignOut={onSignOut} />
      </View>
    );
  }

  return (
    <View style={[container, { width: railWidth + insets.left, alignItems: 'center' }]}>
      <RailButton icon="menu" label="Abrir menú" onPress={() => setOpen(true)} />
      <View style={{ height: 1, alignSelf: 'stretch', marginHorizontal: 12, backgroundColor: colors.border }} />

      <ScrollView contentContainerStyle={{ alignItems: 'center', gap: 4, paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => (
          <RailButton
            key={item.route}
            icon={activeRoute === item.route ? item.activeIcon : item.icon}
            label={item.label}
            active={activeRoute === item.route}
            onPress={() => go(item.route)}
          />
        ))}
      </ScrollView>

      <RailButton icon="log-out-outline" label="Cerrar sesión" danger onPress={onSignOut} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              width: SIDEBAR_PANEL_WIDTH + insets.left,
              maxWidth: '85%',
              backgroundColor: colors.surface,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              borderRightWidth: 1,
              borderRightColor: colors.border,
            }}>
            <ExpandedMenu
              activeRoute={activeRoute}
              onSelect={go}
              onSignOut={onSignOut}
              onClose={() => setOpen(false)}
            />
          </View>
          <Pressable
            style={{ flex: 1, backgroundColor: colors.overlay }}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
          />
        </View>
      </Modal>
    </View>
  );
}

type RailButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
};

function RailButton({ icon, label, onPress, active = false, danger = false }: RailButtonProps) {
  const { colors, radii, touchTarget } = useTheme();
  const size = touchTarget + 4;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        marginVertical: 4,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active
          ? colors.primarySoft
          : pressed
            ? danger
              ? colors.dangerSoft
              : colors.surfaceAlt
            : 'transparent',
      })}>
      <Ionicons
        name={icon}
        size={26}
        color={danger ? colors.dangerText : active ? colors.primaryDark : colors.textMuted}
      />
    </Pressable>
  );
}

type ExpandedMenuProps = {
  activeRoute: string | undefined;
  onSelect: (route: string) => void;
  onSignOut: () => void;
  /** Si existe, muestra el botón ☰ para cerrar (panel en teléfonos). */
  onClose?: () => void;
};

function ExpandedMenu({ activeRoute, onSelect, onSignOut, onClose }: ExpandedMenuProps) {
  const { colors, spacing } = useTheme();
  const profile = useProfile();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xs }}>
        {onClose ? <RailButton icon="menu" label="Cerrar menú" onPress={onClose} /> : null}
        <View style={{ flex: 1, paddingHorizontal: onClose ? 0 : spacing.sm, paddingVertical: spacing.sm }}>
          <AppText variant="subtitle" accessibilityRole="header">
            {APP_CONFIG.name}
          </AppText>
          {profile.data ? (
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              Hola, {profile.data.nombre.split(' ')[0]}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={{ height: 1, marginHorizontal: spacing.sm, backgroundColor: colors.border }} />

      <ScrollView contentContainerStyle={{ paddingVertical: spacing.sm }}>
        {navSections.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.sm }}>
            <AppText
              variant="caption"
              color="textMuted"
              accessibilityRole="header"
              style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xxs, fontWeight: '600' }}>
              {section.title.toUpperCase()}
            </AppText>
            {section.items.map((item) => (
              <MenuRow
                key={item.route}
                item={item}
                active={activeRoute === item.route}
                onPress={() => onSelect(item.route)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.xs }}>
        <MenuRow
          item={{ route: '', label: 'Cerrar sesión', icon: 'log-out-outline', activeIcon: 'log-out' }}
          danger
          onPress={onSignOut}
        />
      </View>
    </View>
  );
}

type MenuRowProps = {
  item: NavItem;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
};

function MenuRow({ item, onPress, active = false, danger = false }: MenuRowProps) {
  const { colors, radii, spacing, touchTarget } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 4,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: radii.md,
        backgroundColor: active
          ? colors.primarySoft
          : pressed
            ? danger
              ? colors.dangerSoft
              : colors.surfaceAlt
            : 'transparent',
      })}>
      <Ionicons
        name={active ? item.activeIcon : item.icon}
        size={24}
        color={danger ? colors.dangerText : active ? colors.primaryDark : colors.textMuted}
      />
      <AppText
        variant="label"
        color={danger ? 'dangerText' : active ? 'primaryDark' : 'text'}
        style={{ flex: 1 }}>
        {item.label}
      </AppText>
    </Pressable>
  );
}
