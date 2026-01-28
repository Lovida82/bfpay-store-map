let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadKakaoMapScript(): Promise<void> {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // 스크립트가 index.html에서 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        isLoaded = true;
        resolve();
      });
      return;
    }

    // 스크립트 로드 대기 (최대 5초)
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkInterval);
        window.kakao.maps.load(() => {
          isLoaded = true;
          resolve();
        });
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Kakao Maps SDK 로드 시간 초과'));
      }
    }, 100);
  });

  return loadPromise;
}

export function isKakaoMapLoaded(): boolean {
  return isLoaded;
}

export function createMap(
  container: HTMLElement,
  options: {
    center: { lat: number; lng: number };
    level: number;
  }
): any {
  const { lat, lng } = options.center;
  const mapOptions = {
    center: new window.kakao.maps.LatLng(lat, lng),
    level: options.level,
  };
  return new window.kakao.maps.Map(container, mapOptions);
}

export function createMarker(
  map: any,
  position: { lat: number; lng: number },
  options?: {
    image?: string;
    title?: string;
  }
): any {
  const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);

  const markerOptions: any = {
    position: markerPosition,
    map,
  };

  if (options?.image) {
    const imageSize = new window.kakao.maps.Size(32, 40);
    const imageOption = { offset: new window.kakao.maps.Point(16, 40) };
    const markerImage = new window.kakao.maps.MarkerImage(options.image, imageSize, imageOption);
    markerOptions.image = markerImage;
  }

  if (options?.title) {
    markerOptions.title = options.title;
  }

  return new window.kakao.maps.Marker(markerOptions);
}

export function createInfoWindow(content: string): any {
  return new window.kakao.maps.InfoWindow({
    content,
    removable: true,
  });
}

export function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!isLoaded) {
      reject(new Error('Kakao Maps SDK is not loaded'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        reject(new Error('주소를 찾을 수 없습니다'));
      }
    });
  });
}

export function reverseGeocode(lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isLoaded) {
      reject(new Error('Kakao Maps SDK is not loaded'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const coords = new window.kakao.maps.LatLng(lat, lng);

    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].road_address?.address_name || result[0].address.address_name;
        resolve(address);
      } else {
        reject(new Error('주소를 찾을 수 없습니다'));
      }
    });
  });
}

export function searchPlaces(
  keyword: string,
  options?: { lat?: number; lng?: number; radius?: number }
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!isLoaded) {
      reject(new Error('Kakao Maps SDK is not loaded'));
      return;
    }

    const ps = new window.kakao.maps.services.Places();

    const searchOptions: any = {};
    if (options?.lat && options?.lng) {
      searchOptions.location = new window.kakao.maps.LatLng(options.lat, options.lng);
      searchOptions.radius = options.radius || 1000;
      searchOptions.sort = window.kakao.maps.services.SortBy.DISTANCE;
    }

    ps.keywordSearch(
      keyword,
      (data: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve(data);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error('검색에 실패했습니다'));
        }
      },
      searchOptions
    );
  });
}
