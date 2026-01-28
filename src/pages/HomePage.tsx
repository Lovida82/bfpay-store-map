import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KakaoMap, MapControls } from '@/components/map';
import { StoreList, StoreSearch, StoreFilter } from '@/components/store';
import { useStoreStore, useMapStore } from '@/stores';
import { getAllStores } from '@/services/api/stores';
import type { Store } from '@/types/store';
import { clsx } from 'clsx';

export function HomePage() {
  const navigate = useNavigate();
  const { filteredStores, setStores, setSelectedStore, selectedStore, isLoading, setLoading, setError } = useStoreStore();
  const { setSelectedStore: setMapSelectedStore, setCenter, setUserLocation } = useMapStore();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // 초기 로드시 현재 위치로 이동
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.log('Geolocation not available or denied:', error);
          // 위치 정보 실패 시 기본 위치 유지
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [setCenter, setUserLocation]);

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        const stores = await getAllStores();
        setStores(stores);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        setError('가맹점 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [setStores, setLoading, setError]);

  const handleMarkerClick = useCallback(
    (store: Store) => {
      setSelectedStore(store);
      setMapSelectedStore(store.id);
      setIsBottomSheetOpen(true);
    },
    [setSelectedStore, setMapSelectedStore]
  );

  const handleMapClick = useCallback(() => {
    setSelectedStore(null);
    setMapSelectedStore(null);
  }, [setSelectedStore, setMapSelectedStore]);

  const handleStoreClick = useCallback(
    (store: Store) => {
      setSelectedStore(store);
      setMapSelectedStore(store.id);
      setCenter(store.coordinates);
    },
    [setSelectedStore, setMapSelectedStore, setCenter]
  );

  const handleStoreDoubleClick = useCallback(
    (store: Store) => {
      navigate(`/store/${store.id}`);
    },
    [navigate]
  );

  return (
    <div className="h-[calc(100vh-4rem)] relative flex">
      {/* 데스크탑: 좌측 사이드 패널 */}
      <div className="hidden lg:flex lg:w-96 lg:flex-col bg-white border-r shadow-lg z-10">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900 mb-4">가맹점 목록</h2>
          <div className="space-y-3">
            <StoreSearch />
            <StoreFilter />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>등록된 가맹점이 없습니다</p>
              <button
                onClick={() => navigate('/register')}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                첫 번째 가맹점 등록하기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  onDoubleClick={() => handleStoreDoubleClick(store)}
                  className={clsx(
                    'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md group',
                    selectedStore?.id === store.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                  title="더블클릭하여 상세보기"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{store.category}</p>
                      <p className="text-xs text-gray-400 mt-1">{store.address}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={clsx(
                          'inline-block w-3 h-3 rounded-full',
                          store.verificationCount === 0
                            ? 'bg-gray-400'
                            : store.trustScore >= 70 && store.verificationCount >= 3
                              ? 'bg-green-500'
                              : store.trustScore >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        )}
                      />
                      <span className="text-xs text-gray-400 mt-1">
                        검증 {store.verificationCount}회
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    더블클릭하여 상세보기
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-4">
            총 {filteredStores.length}개의 가맹점
          </p>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <KakaoMap onMarkerClick={handleMarkerClick} onMapClick={handleMapClick} />
        <MapControls />
      </div>

      {/* 모바일: 하단 시트 */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 pointer-events-none">
        <div
          className={clsx(
            'pointer-events-auto bg-white rounded-t-2xl shadow-lg transition-transform duration-300',
            isBottomSheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'
          )}
        >
          <button
            onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
            className="w-full py-3 flex items-center justify-center"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </button>

          <div className="px-4 pb-4">
            <div className="space-y-3 mb-4">
              <StoreSearch />
              <StoreFilter />
            </div>

            <div className="max-h-64 overflow-y-auto">
              <StoreList
                stores={filteredStores.slice(0, 10)}
                isLoading={isLoading}
                emptyMessage="등록된 가맹점이 없습니다"
                onStoreClick={handleStoreClick}
              />

              {filteredStores.length > 10 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  +{filteredStores.length - 10}개 더 있습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
