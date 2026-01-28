import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadKakaoMapScript, createMap, createMarker } from '@/services/kakaoMap';
import { useMapStore, useStoreStore } from '@/stores';
import { getTrustLevel, TRUST_LEVEL_COLORS } from '@/types/map';
import type { Store } from '@/types/store';

interface KakaoMapProps {
  onMarkerClick?: (store: Store) => void;
  onMapClick?: () => void;
}

// 전역 함수로 상세페이지 이동 (InfoWindow 클릭용)
declare global {
  interface Window {
    navigateToStore?: (storeId: string) => void;
  }
}

export function KakaoMap({ onMarkerClick, onMapClick }: KakaoMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMovingRef = useRef(false);

  const { center, level, setLevel, setBounds, selectedStoreId } = useMapStore();
  const { filteredStores } = useStoreStore();

  // 전역 네비게이션 함수 등록
  useEffect(() => {
    window.navigateToStore = (storeId: string) => {
      navigate(`/store/${storeId}`);
    };
    return () => {
      delete window.navigateToStore;
    };
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      try {
        await loadKakaoMapScript();

        if (!mounted || !mapRef.current) return;

        mapInstanceRef.current = createMap(mapRef.current, {
          center,
          level,
        });

        const map = mapInstanceRef.current;

        // center_changed 이벤트는 무한루프 방지를 위해 제거
        // 대신 bounds_changed만 사용

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setLevel(map.getLevel());
        });

        window.kakao.maps.event.addListener(map, 'bounds_changed', () => {
          if (isMovingRef.current) return;
          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          setBounds({
            sw: { lat: sw.getLat(), lng: sw.getLng() },
            ne: { lat: ne.getLat(), lng: ne.getLng() },
          });
        });

        window.kakao.maps.event.addListener(map, 'click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          onMapClick?.();
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Kakao Map:', err);
        setError('카카오맵을 불러올 수 없습니다. API 키를 확인해주세요.');
      }
    }

    initMap();

    return () => {
      mounted = false;
    };
  }, []);

  const createCustomMarkerImage = useCallback((trustLevel: string) => {
    const color = TRUST_LEVEL_COLORS[trustLevel as keyof typeof TRUST_LEVEL_COLORS] || '#9ca3af';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="14" r="6" fill="white"/>
      </svg>
    `;

    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml,${encodedSvg}`;
  }, []);

  // 신뢰도에 따른 상태 텍스트
  const getTrustStatusText = (trustScore: number, verificationCount: number) => {
    if (verificationCount === 0) return '미검증';
    if (trustScore >= 70) return '검증완료';
    if (trustScore >= 40) return '검증중';
    return '주의';
  };

  // 신뢰도에 따른 상태 색상
  const getTrustStatusColor = (trustScore: number, verificationCount: number) => {
    if (verificationCount === 0) return '#9ca3af'; // gray
    if (trustScore >= 70) return '#22c55e'; // green
    if (trustScore >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // 별점 표시 생성
  const createStarRating = (score: number) => {
    const fullStars = Math.floor(score / 20); // 100점 만점 기준으로 5점 만점으로 변환
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    return stars;
  };

  // 마커 생성
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    console.log('Creating markers for', filteredStores.length, 'stores');

    filteredStores.forEach((store) => {
      // 좌표가 유효한지 확인
      if (!store.coordinates || store.coordinates.lat === 0 || store.coordinates.lng === 0) {
        console.warn('Invalid coordinates for store:', store.name, store.coordinates);
        return;
      }

      const trustLevel = getTrustLevel(store.trustScore, store.verificationCount);
      const markerImage = createCustomMarkerImage(trustLevel);

      const marker = createMarker(map, store.coordinates, {
        image: markerImage,
        title: store.name,
      });

      // 상태 정보
      const statusText = getTrustStatusText(store.trustScore, store.verificationCount);
      const statusColor = getTrustStatusColor(store.trustScore, store.verificationCount);
      const stars = createStarRating(store.trustScore);

      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoContent = `
          <div
            onclick="window.navigateToStore('${store.id}')"
            style="padding: 12px; min-width: 200px; font-family: sans-serif; cursor: pointer; transition: background 0.2s;"
            onmouseover="this.style.background='#f8fafc'"
            onmouseout="this.style.background='white'"
          >
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #1e40af;">${store.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${store.category}</div>
            <div style="font-size: 11px; color: #888; margin-bottom: 8px;">${store.address}</div>
            <div style="display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <span style="font-size: 14px; color: #f59e0b;">${stars}</span>
              <span style="font-size: 11px; color: ${statusColor}; font-weight: 600; background: ${statusColor}20; padding: 2px 6px; border-radius: 4px;">${statusText}</span>
            </div>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">검증 ${store.verificationCount}회 · 신뢰도 ${Math.round(store.trustScore)}%</div>
            <div style="font-size: 11px; color: #3b82f6; margin-top: 8px; text-align: center; padding: 6px; background: #eff6ff; border-radius: 4px;">
              클릭하여 상세보기 →
            </div>
          </div>
        `;

        infoWindowRef.current = new window.kakao.maps.InfoWindow({
          content: infoContent,
        });
        infoWindowRef.current.open(map, marker);

        onMarkerClick?.(store);
      });

      markersRef.current.set(store.id, marker);
    });

    console.log('Markers created:', markersRef.current.size);
  }, [filteredStores, isLoaded, onMarkerClick, createCustomMarkerImage]);

  // 선택된 매장으로 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !selectedStoreId) return;

    const marker = markersRef.current.get(selectedStoreId);
    if (marker) {
      isMovingRef.current = true;
      const position = marker.getPosition();
      mapInstanceRef.current.setCenter(position);
      setTimeout(() => {
        isMovingRef.current = false;
      }, 100);
    }
  }, [selectedStoreId, isLoaded]);

  // center 변경 시 지도 이동 (store에서 center가 변경되었을 때)
  const prevCenterRef = useRef(center);
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const prevCenter = prevCenterRef.current;
    // 이전 center와 다를 때만 이동
    if (Math.abs(prevCenter.lat - center.lat) > 0.0001 || Math.abs(prevCenter.lng - center.lng) > 0.0001) {
      isMovingRef.current = true;
      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapInstanceRef.current.setCenter(newCenter);
      prevCenterRef.current = center;
      setTimeout(() => {
        isMovingRef.current = false;
      }, 100);
    }
  }, [center, isLoaded]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">.env.local 파일에 VITE_KAKAO_MAP_API_KEY를 설정해주세요.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full min-h-[400px]" />;
}
