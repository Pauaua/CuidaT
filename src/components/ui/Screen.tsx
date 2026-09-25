import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useContentWidth } from '@/lib/layout';
import { maxContentWidth, useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  /** Si es false, el contenido no hace scroll (útil con FlatList propia). */
  scroll?: boolean;
  /** Elementos fijos sobre el contenido (por ejemplo un FAB). */
  overlay?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
};

/**
 * Contenedor base de pantalla: área segura, fondo del tema, teclado
 * y ancho máximo centrado en tablets.
 */
export function Screen({
  children,
  scroll = true,
  overlay,
  refreshing = false,
  onRefresh,
  edges = ['top', 'left', 'right'],
}: Props) {
  const { colors, spacing } = useTheme();
  const contentWidth = useContentWidth();
  // Márgenes según el espacio real (descontando la barra lateral)
  const horizontalPadding =
    contentWidth < 360 ? spacing.sm : contentWidth < 480 ? spacing.md : spacing.lg;

  const inner = {
    width: '100%' as const,
    maxWidth: maxContentWidth,
    alignSelf: 'center' as const,
    paddingHorizontal: horizontalPadding,
  };

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[inner, { paddingBottom: spacing.xxxl * 2 }]}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primaryDark]}
                />
              ) : undefined
            }>
            {children}
          </ScrollView>
        ) : (
          <View style={[inner, { flex: 1 }]}>{children}</View>
        )}
        {overlay}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
