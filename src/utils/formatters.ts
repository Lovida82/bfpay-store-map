import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy.MM.dd', { locale: ko });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
}

export function formatTrustScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}
