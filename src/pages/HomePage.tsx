import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KakaoMap, MapControls } from '@/components/map';
import { StoreSearch, StoreFilter } from '@/components/store';
import { useStoreStore, useMapStore } from '@/stores';
import { getAllStores } from '@/services/api/stores';
import type { Store } from '@/types/store';
import { clsx } from 'clsx';

export function HomePage() {
  const navigate = useNavigate();
  const { filteredStores, setStores, setSelectedStore, selectedStore, isLoading, setLoading, setError } = useStoreStore();
  const { setSelectedStore: setMapSelectedStore, setCenter, setUserLocation, bounds } = useMapStore();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [filterByBounds, setFilterByBounds] = useState(false);

  // 지도 범위 내 가맹점만 필터링
  const visibleStores = useMemo(() => {
    // 조회 버튼을 누르지 않았으면 전체 목록 표시
    if (!filterByBounds || !bounds) return filteredStores;

    return filteredStores.filter((store) => {
      const { lat, lng } = store.coordinates;
      return (
        lat >= bounds.sw.lat &&
        lat <= bounds.ne.lat &&
        lng >= bounds.sw.lng &&
        lng <= bounds.ne.lng
      );
    });
  }, [filteredStores, bounds, filterByBounds]);

  // 조회 버튼 클릭 핸들러
  const handleSearchInBounds = useCallback(() => {
    setFilterByBounds(true);
  }, []);

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
          ) : visibleStores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filterByBounds ? (
                <>
                  <p>현재 지도 범위에 가맹점이 없습니다</p>
                  <button
                    onClick={() => setFilterByBounds(false)}
                    className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    전체 목록 보기
                  </button>
                </>
              ) : (
                <>
                  <p>등록된 가맹점이 없습니다</p>
                  <button
                    onClick={() => navigate('/register')}
                    className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    첫 번째 가맹점 등록하기
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleStores.map((store) => (
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

          <div className="text-center mt-4">
            {filterByBounds ? (
              <>
                <p className="text-sm text-gray-500">
                  지도 범위 내 <span className="font-medium text-primary-600">{visibleStores.length}</span>개 / 전체 {filteredStores.length}개
                </p>
                <button
                  onClick={() => setFilterByBounds(false)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  전체 목록 보기
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                전체 {filteredStores.length}개의 가맹점
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <KakaoMap onMarkerClick={handleMarkerClick} onMapClick={handleMapClick} />
        <MapControls onSearchInBounds={handleSearchInBounds} />
      </div>

      {/* 모바일: 하단 시트 */}
      <div
        className={clsx(
          'lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 z-30',
          isBottomSheetOpen ? 'h-[70vh]' : 'h-auto'
        )}
        style={{
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* 핸들 및 요약 정보 */}
        <button
          onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
          className="w-full py-3 flex flex-col items-center border-b border-gray-100"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{filterByBounds ? '지도 범위 내' : '가맹점 목록'}</span>
            <span className="text-primary-600 font-bold">{visibleStores.length}개</span>
            <svg
              className={clsx('w-4 h-4 text-gray-400 transition-transform', isBottomSheetOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        {/* 펼쳐진 내용 */}
        {isBottomSheetOpen && (
          <div className="flex flex-col h-[calc(70vh-60px)] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <StoreSearch />
              <div className="mt-2">
                <StoreFilter />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : visibleStores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {filterByBounds ? (
                    <>
                      <p>현재 지도 범위에 가맹점이 없습니다</p>
                      <button
                        onClick={() => setFilterByBounds(false)}
                        className="mt-2 text-primary-600 text-sm underline"
                      >
                        전체 목록 보기
                      </button>
                    </>
                  ) : (
                    <p>등록된 가맹점이 없습니다</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleStores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => {
                        handleStoreClick(store);
                        setIsBottomSheetOpen(false);
                      }}
                      className={clsx(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        selectedStore?.id === store.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{store.name}</h3>
                          <p className="text-sm text-gray-500">{store.category}</p>
                          <p className="text-xs text-gray-400 truncate">{store.address}</p>
                        </div>
                        <div className="flex flex-col items-end ml-2">
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
                            {store.verificationCount}회
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
