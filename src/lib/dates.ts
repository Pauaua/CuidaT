import { APP_CONFIG } from '@/config/app';

const locale = APP_CONFIG.locale;

const pad = (n: number) => String(n).padStart(2, '0');

/** YYYY-MM-DD según la hora local. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Crea una fecha local a partir de YYYY-MM-DD. */
export function fromISODate(value: string): Date {
  const [y = 1970, m = 1, d = 1] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Lunes 00:00 de la semana de la fecha dada. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  return addDays(d, -day);
}

export function endOfWeek(date: Date): Date {
  return endOfDay(addDays(startOfWeek(date), 6));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

/** "08:00:00" o "8:5" → "08:00" / "08:05". */
export function normalizeTime(value: string): string {
  const [h = '0', m = '0'] = value.split(':');
  return `${pad(Number(h))}:${pad(Number(m))}`;
}

export function timeToMinutes(value: string): number {
  const [h = '0', m = '0'] = value.split(':');
  return Number(h) * 60 + Number(m);
}

export function dateToTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Combina una fecha (día) y una hora HH:MM en un Date local. */
export function timeToDate(value: string, base = new Date()): Date {
  const d = new Date(base);
  const [h = '0', m = '0'] = value.split(':');
  d.setHours(Number(h), Number(m), 0, 0);
  return d;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: Date): string {
  return `${formatShortDate(date)}, ${dateToTime(date)}`;
}

/** Horas de solapamiento entre [start, end] y [rangeStart, rangeEnd]. */
export function overlapHours(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): number {
  const from = Math.max(start.getTime(), rangeStart.getTime());
  const to = Math.min(end.getTime(), rangeEnd.getTime());
  return Math.max(0, to - from) / 3_600_000;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function greetingForHour(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
