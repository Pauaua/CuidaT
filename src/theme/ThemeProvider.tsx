import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorTokens } from './colors';
import { makeShadows, radii, spacing, touchTarget, typography } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: ReturnType<typeof makeShadows>;
  touchTarget: number;
};

function buildTheme(scheme: 'light' | 'dark'): Theme {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return {
    scheme,
    colors,
    spacing,
    radii,
    typography,
    shadows: makeShadows(colors.shadow),
    touchTarget,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

type Props = {
  preference: ThemePreference;
  children: ReactNode;
};

export function ThemeProvider({ preference, children }: Props) {
  const systemScheme = useColorScheme();
  const scheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const theme = useMemo(() => buildTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
