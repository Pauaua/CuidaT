import { Alert, Linking } from 'react-native';

export async function callPhone(phone: string): Promise<void> {
  const url = `tel:${phone.replace(/[^\d+]/g, '')}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo llamar', 'Tu dispositivo no permite hacer llamadas desde la app.');
  }
}

export async function openInMaps(address: string): Promise<void> {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo abrir el mapa', 'Inténtalo de nuevo más tarde.');
  }
}
