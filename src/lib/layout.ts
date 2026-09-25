import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

/** Ancho desde el cual el menú lateral queda abierto con nombres (tablets). */
const PERMANENT_SIDEBAR_MIN_WIDTH = 900;
/** Ancho del menú abierto con nombres. */
export const SIDEBAR_PANEL_WIDTH = 280;

/** Por debajo de este ancho de contenido, la interfaz usa su versión compacta. */
const COMPACT_CONTENT_WIDTH = 360;

export function isPermanentSidebar(windowWidth: number): boolean {
  return windowWidth >= PERMANENT_SIDEBAR_MIN_WIDTH;
}

/** Ancho que ocupa la barra lateral según el tamaño de la pantalla. */
export function getSidebarWidth(windowWidth: number): number {
  if (isPermanentSidebar(windowWidth)) return SIDEBAR_PANEL_WIDTH;
  return windowWidth < 380 ? 64 : 72;
}

/**
 * Ancho que ocupa la barra lateral en la pantalla actual (0 fuera de ella,
 * por ejemplo en el login o en los formularios modales).
 */
export const SidebarWidthContext = createContext(0);

/** Ancho real disponible para el contenido (pantalla menos barra lateral). */
export function useContentWidth(): number {
  const { width } = useWindowDimensions();
  const sidebar = useContext(SidebarWidthContext);
  return width - sidebar;
}

/** true en espacios angostos (teléfonos pequeños con la barra lateral). */
export function useIsCompact(): boolean {
  return useContentWidth() < COMPACT_CONTENT_WIDTH;
}
