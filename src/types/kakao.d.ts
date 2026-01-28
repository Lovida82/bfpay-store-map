declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    getCenter(): LatLng;
    setCenter(latlng: LatLng): void;
    getLevel(): number;
    setLevel(level: number): void;
    getBounds(): LatLngBounds;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: object);
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
    title?: string;
  }

  interface InfoWindowOptions {
    content: string;
    removable?: boolean;
  }

  namespace event {
    function addListener(target: any, type: string, callback: () => void): void;
  }

  namespace services {
    class Geocoder {
      addressSearch(address: string, callback: (result: any[], status: any) => void): void;
      coord2Address(lng: number, lat: number, callback: (result: any[], status: any) => void): void;
    }

    class Places {
      keywordSearch(keyword: string, callback: (data: any[], status: any) => void, options?: object): void;
    }

    const Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };

    const SortBy: {
      DISTANCE: string;
      ACCURACY: string;
    };
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: {
    maps: typeof kakao.maps & {
      load: (callback: () => void) => void;
    };
  };
}
