/**
 * Paleta pastel: morado lavanda, blanco y celeste.
 * Todos los componentes deben usar estos tokens (vía useTheme), nunca hex directos.
 *
 * Nota de accesibilidad: `textMuted` se oscureció levemente respecto a la
 * propuesta (#7A7290 → #6B6384) para cumplir contraste AA (≥ 4.5:1) sobre `background`.
 */
export type ColorTokens = {
  primary: string;
  primarySoft: string;
  primaryDark: string;
  onPrimary: string;
  secondary: string;
  secondarySoft: string;
  secondaryDark: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPastel: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  skeleton: string;
  overlay: string;
  shadow: string;
  /** Colores del calendario de recreación */
  eventCare: string;
  eventFreeDay: string;
  eventSocial: string;
  eventSelfCare: string;
};

export const lightColors: ColorTokens = {
  primary: '#9B7FD4',
  primarySoft: '#E6DDF8',
  primaryDark: '#6B4FA8',
  onPrimary: '#FFFFFF',
  secondary: '#7EC4E8',
  secondarySoft: '#DDF1FB',
  secondaryDark: '#2F6F91',
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EFFB',
  border: '#E3DCF2',
  text: '#3D3551',
  textMuted: '#6B6384',
  textOnPastel: '#3D3551',
  success: '#A8E6CF',
  successSoft: '#E4F7EF',
  warning: '#FFE3A3',
  warningSoft: '#FFF5DD',
  danger: '#F5B7C5',
  dangerSoft: '#FDE9EE',
  dangerText: '#A33A55',
  skeleton: '#ECE6F7',
  overlay: 'rgba(61, 53, 81, 0.4)',
  shadow: '#6B4FA8',
  eventCare: '#9B7FD4',
  eventFreeDay: '#7EC4E8',
  eventSocial: '#F5B7C5',
  eventSelfCare: '#A8E6CF',
};

/** Misma paleta, en versión apagada para modo oscuro. */
export const darkColors: ColorTokens = {
  primary: '#B39DE0',
  primarySoft: '#3A3052',
  primaryDark: '#D6C9F5',
  onPrimary: '#1E1A2B',
  secondary: '#8FCBEA',
  secondarySoft: '#1F3441',
  secondaryDark: '#B5DFF3',
  background: '#17141F',
  surface: '#221E2E',
  surfaceAlt: '#2B2639',
  border: '#3A3450',
  text: '#EEEAF6',
  textMuted: '#B5ADC8',
  textOnPastel: '#1E1A2B',
  success: '#7FC4AA',
  successSoft: '#20362E',
  warning: '#E6C77F',
  warningSoft: '#3A3222',
  danger: '#E09AAB',
  dangerSoft: '#3D2530',
  dangerText: '#F5B7C5',
  skeleton: '#2E2940',
  overlay: 'rgba(0, 0, 0, 0.55)',
  shadow: '#000000',
  eventCare: '#B39DE0',
  eventFreeDay: '#8FCBEA',
  eventSocial: '#E09AAB',
  eventSelfCare: '#7FC4AA',
};
