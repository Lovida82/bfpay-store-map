export interface Store {
  id: string;
  name: string;
  address: string;
  addressDetail?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  category: StoreCategory;
  subCategory?: string;
  businessNumber?: string;
  zeropaySupported: boolean;
  bipaySupported: boolean;
  trustScore: number;
  verificationCount: number;
  positiveCount: number;
  negativeCount: number;
  status: StoreStatus;
  sourceType: SourceType;
  sourceImageUrl?: string;
  registeredBy: string;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type StoreCategory =
  | '음식점'
  | '카페';

export const STORE_CATEGORIES: StoreCategory[] = [
  '음식점',
  '카페',
];

export type StoreStatus = 'pending' | 'verified' | 'rejected' | 'closed';

export type SourceType = 'manual' | 'ocr' | 'excel' | 'api';

export interface StoreCreateInput {
  name: string;
  address: string;
  addressDetail?: string;
  phone?: string;
  category: StoreCategory;
  subCategory?: string;
  businessNumber?: string;
  sourceType: SourceType;
  sourceImageUrl?: string;
}

export interface StoreSearchParams {
  query?: string;
  category?: StoreCategory;
  status?: StoreStatus;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface StoreSearchResult {
  stores: Store[];
  total: number;
  page: number;
  hasMore: boolean;
}
