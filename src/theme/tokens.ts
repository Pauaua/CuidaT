import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Escala de espaciado (múltiplos de 4). */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

/** Tamaño mínimo de área táctil (accesibilidad). */
export const touchTarget = 48;

/** Ancho máximo del contenido en tablets, para que la lectura sea cómoda. */
export const maxContentWidth = 760;

/** Límite al escalado de fuente del sistema, para no romper el layout. */
export const maxFontSizeMultiplier = 1.8;

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif', default: undefined });
const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: undefined,
});

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'label'
  | 'caption';

/** Texto base 16 (mínimo de accesibilidad); los secundarios nunca bajan de 13. */
export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontFamily: fontFamilyMedium, fontSize: 26, lineHeight: 34, fontWeight: '700' },
  title: { fontFamily: fontFamilyMedium, fontSize: 21, lineHeight: 28, fontWeight: '700' },
  subtitle: { fontFamily: fontFamilyMedium, fontSize: 18, lineHeight: 25, fontWeight: '600' },
  bodyLarge: { fontFamily, fontSize: 17, lineHeight: 24, fontWeight: '400' },
  body: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontFamily: fontFamilyMedium, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '400' },
};

export function makeShadows(shadowColor: string) {
  const soft: ViewStyle = {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  };
  const medium: ViewStyle = {
    shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  };
  return { soft, medium, none: {} as ViewStyle };
}
