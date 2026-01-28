import supabase from '../supabase';
import { geocodeAddress } from '../kakaoMap';
import type { Store, StoreCreateInput, StoreSearchParams, StoreSearchResult } from '@/types/store';

// 중복 매장 확인
export async function checkDuplicateStore(name: string, address: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .or(`name.ilike.%${name}%,address.ilike.%${address}%`)
    .in('status', ['verified', 'pending'])
    .limit(1);

  if (error) {
    console.error('Duplicate check error:', error);
    return null;
  }

  if (data && data.length > 0) {
    return mapStoreFromDB(data[0]);
  }
  return null;
}

export async function createStore(input: StoreCreateInput): Promise<Store> {
  const { lat, lng } = await geocodeAddress(input.address);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  // 좌표를 별도 컬럼에도 저장 (lat, lng)
  const { data, error } = await supabase
    .from('stores')
    .insert({
      name: input.name,
      address: input.address,
      address_detail: input.addressDetail,
      coordinates: `POINT(${lng} ${lat})`,
      lat: lat,
      lng: lng,
      phone: input.phone,
      category: input.category,
      sub_category: input.subCategory,
      business_number: input.businessNumber,
      source_type: input.sourceType,
      source_image_url: input.sourceImageUrl,
      registered_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return mapStoreFromDB(data);
}

// 매장 삭제
export async function deleteStore(storeId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  // 본인이 등록한 매장만 삭제 가능
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', storeId)
    .eq('registered_by', user.id);

  if (error) throw error;
}

// 내가 등록한 매장 조회
export async function getMyStores(): Promise<Store[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('registered_by', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapStoreFromDB);
}

export async function getStoresWithinRadius(
  lat: number,
  lng: number,
  radius: number = 1000,
  category?: string
): Promise<Store[]> {
  const { data, error } = await supabase.rpc('get_stores_within_radius', {
    center_lat: lat,
    center_lng: lng,
    radius_meters: radius,
    category_filter: category || null,
    status_filter: 'verified',
  });

  if (error) throw error;
  return (data || []).map(mapStoreFromRPC);
}

export async function searchStores(params: StoreSearchParams): Promise<StoreSearchResult> {
  const { query, category, status, page = 1, limit = 20 } = params;

  let queryBuilder = supabase.from('stores').select('*', { count: 'exact' });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,address.ilike.%${query}%`);
  }

  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  } else {
    queryBuilder = queryBuilder.in('status', ['verified', 'pending']);
  }

  const offset = (page - 1) * limit;
  queryBuilder = queryBuilder.order('trust_score', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;

  return {
    stores: (data || []).map(mapStoreFromDB),
    total: count || 0,
    page,
    hasMore: (count || 0) > offset + limit,
  };
}

export async function getStoreById(id: string): Promise<Store> {
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();

  if (error) throw error;
  return mapStoreFromDB(data);
}

export async function getAllStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .in('status', ['verified', 'pending'])
    .order('trust_score', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapStoreFromDB);
}

function mapStoreFromDB(data: any): Store {
  let lat = 0;
  let lng = 0;

  // 먼저 별도 lat/lng 컬럼 확인
  if (data.lat && data.lng) {
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);
  } else if (data.coordinates) {
    // PostGIS POINT 형식 파싱 시도
    if (typeof data.coordinates === 'string') {
      const coordMatch = data.coordinates.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (coordMatch) {
        lng = parseFloat(coordMatch[1]);
        lat = parseFloat(coordMatch[2]);
      }
    } else if (typeof data.coordinates === 'object') {
      // JSON 형식인 경우
      lat = data.coordinates.y || data.coordinates.lat || 0;
      lng = data.coordinates.x || data.coordinates.lng || 0;
    }
  }

  console.log('Store loaded:', data.name, 'coordinates:', { lat, lng });

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    addressDetail: data.address_detail,
    coordinates: { lat, lng },
    phone: data.phone,
    category: data.category,
    subCategory: data.sub_category,
    businessNumber: data.business_number,
    zeropaySupported: data.zeropay_supported ?? true,
    bipaySupported: data.bipay_supported ?? true,
    trustScore: parseFloat(data.trust_score) || 0,
    verificationCount: data.verification_count || 0,
    positiveCount: data.positive_count || 0,
    negativeCount: data.negative_count || 0,
    status: data.status,
    sourceType: data.source_type,
    sourceImageUrl: data.source_image_url,
    registeredBy: data.registered_by,
    lastVerifiedAt: data.last_verified_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapStoreFromRPC(data: any): Store {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    coordinates: { lat: data.lat, lng: data.lng },
    category: data.category,
    trustScore: parseFloat(data.trust_score) || 0,
    zeropaySupported: true,
    bipaySupported: true,
    verificationCount: 0,
    positiveCount: 0,
    negativeCount: 0,
    status: 'verified',
    sourceType: 'manual',
    registeredBy: '',
    createdAt: '',
    updatedAt: '',
  } as Store;
}
