import { useState } from 'react';
import { useMapStore } from '@/stores';
import { Button } from '@/components/common';
import toast from 'react-hot-toast';

export function CurrentLocationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { setCenter, setUserLocation } = useMapStore();

  const handleClick = () => {
    if (!navigator.geolocation) {
      toast.error('위치 정보를 사용할 수 없습니다');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        setCenter(location);
        setIsLoading(false);
        toast.success('현재 위치로 이동했습니다');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('위치 정보 접근이 거부되었습니다');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('위치 정보를 사용할 수 없습니다');
            break;
          case error.TIMEOUT:
            toast.error('위치 정보 요청 시간이 초과되었습니다');
            break;
          default:
            toast.error('위치 정보를 가져올 수 없습니다');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className="shadow-lg"
    >
      {isLoading ? (
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </Button>
  );
}
