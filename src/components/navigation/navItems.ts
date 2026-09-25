import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export type NavItem = { route: string; label: string; icon: IconName; activeIcon: IconName };

/** Módulos del menú lateral; `route` es el nombre del archivo en src/app/(drawer). */
export const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Día a día',
    items: [
      { route: 'index', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
      { route: 'cuidado', label: 'Cuidado', icon: 'heart-outline', activeIcon: 'heart' },
      { route: 'inventario', label: 'Inventario', icon: 'cube-outline', activeIcon: 'cube' },
      { route: 'registros', label: 'Registros', icon: 'time-outline', activeIcon: 'time' },
    ],
  },
  {
    title: 'Para ti',
    items: [
      { route: 'recreacion', label: 'Recreación', icon: 'sunny-outline', activeIcon: 'sunny' },
      { route: 'perfil', label: 'Mi perfil', icon: 'person-circle-outline', activeIcon: 'person-circle' },
    ],
  },
  {
    title: 'Ayuda',
    items: [
      { route: 'informaciones', label: 'Servicios útiles', icon: 'call-outline', activeIcon: 'call' },
      { route: 'configuracion', label: 'Configuración', icon: 'settings-outline', activeIcon: 'settings' },
    ],
  },
];

export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
