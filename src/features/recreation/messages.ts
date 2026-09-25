/**
 * Mensajes de bienestar. Regla de tono: acompañar, nunca culpar.
 * Nada de "deberías" ni "no te has cuidado".
 */

export function weeklyBalanceMessage(freeHours: number, careHours: number): string {
  if (freeHours === 0 && careHours === 0) {
    return 'Tu semana está en blanco. ¿Te regalas un ratito para ti? Aunque sean 30 minutos, cuentan.';
  }
  if (freeHours === 0) {
    return 'Has puesto mucho cariño en cuidar esta semana. Un café tranquilo o una caminata corta también son parte del cuidado.';
  }
  const ratio = careHours === 0 ? 1 : freeHours / (freeHours + careHours);
  if (ratio < 0.15) {
    return 'Ya tienes un espacio para ti, ¡qué bueno! Si puedes sumar otro momento, tu cuerpo te lo va a agradecer.';
  }
  if (ratio < 0.35) {
    return 'Vas encontrando tu equilibrio. Descansar también es cuidar.';
  }
  return '¡Qué lindo verte con tiempo para ti! Disfrútalo sin culpa, te lo mereces.';
}

export const restInvitations = [
  'Esta semana aún no tienes un momento libre agendado. ¿Qué te gustaría hacer solo para ti?',
  'Un ratito para ti también es parte del cuidado. ¿Agendamos algo?',
  'Pedir ayuda y tomar un descanso es de valientes. ¿Buscamos un espacio en tu semana?',
];

export function pickInvitation(date = new Date()): string {
  return restInvitations[date.getDate() % restInvitations.length] ?? restInvitations[0]!;
}
