import type { StoreCategory } from './store';

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapBounds {
  sw: MapPosition;
  ne: MapPosition;
}

export interface MapState {
  center: MapPosition;
  level: number;
  bounds?: MapBounds;
}

export type TrustLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface MarkerData {
  id: string;
  position: MapPosition;
  trustLevel: TrustLevel;
  category: StoreCategory;
  name: string;
}

export function getTrustLevel(score: number, count: number): TrustLevel {
  // score는 0-100 범위
  // 검증 횟수 0: 미검증 (회색)
  // 검증 횟수 1-2: 신뢰도에 따라 표시
  // 검증 횟수 3+: 신뢰도에 따라 표시
  if (count === 0) return 'unverified';
  if (score >= 70) return 'high';      // 녹색
  if (score >= 40) return 'medium';    // 노랑
  return 'low';                        // 빨강
}

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  high: '#22c55e',
  medium: '#eab308',
  low: '#ef4444',
  unverified: '#9ca3af',
};

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  high: '검증됨',
  medium: '확인 필요',
  low: '주의',
  unverified: '미검증',
};
