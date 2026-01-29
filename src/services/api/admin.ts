import supabase from '../supabase';
import type { User } from '@/types/user';
import type { Store } from '@/types/store';
import type { Verification, Comment } from '@/types/verification';

// ============ 통계 ============

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalVerifications: number;
  totalComments: number;
  pendingStores: number;
  verifiedStores: number;
  rejectedStores: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, stores, verifications, comments] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('status'),
    supabase.from('verifications').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
  ]);

  const storesByStatus = (stores.data || []).reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalUsers: users.count || 0,
    totalStores: stores.data?.length || 0,
    totalVerifications: verifications.count || 0,
    totalComments: comments.count || 0,
    pendingStores: storesByStatus['pending'] || 0,
    verifiedStores: storesByStatus['verified'] || 0,
    rejectedStores: storesByStatus['rejected'] || 0,
  };
}

// ============ 사용자 관리 ============

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapUserFromDB);
}

export async function updateUserTrustLevel(userId: string, trustLevel: number): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ trust_level: trustLevel, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

// ============ 가맹점 관리 ============

export async function getAllStoresAdmin(): Promise<Store[]> {
  const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapStoreFromDB);
}

export async function updateStoreStatus(storeId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('stores')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', storeId);

  if (error) throw error;
}

export async function deleteStoreAdmin(storeId: string): Promise<void> {
  // 관련 검증 및 댓글 먼저 삭제
  await supabase.from('verifications').delete().eq('store_id', storeId);
  await supabase.from('comments').delete().eq('store_id', storeId);

  const { error } = await supabase.from('stores').delete().eq('id', storeId);

  if (error) throw error;
}

// ============ 검증 관리 ============

export interface VerificationWithStore extends Verification {
  store?: {
    name: string;
    address: string;
  };
}

export async function getAllVerifications(): Promise<VerificationWithStore[]> {
  const { data, error } = await supabase
    .from('verifications')
    .select(
      `
      *,
      users:user_id (nickname, avatar_url, trust_level),
      stores:store_id (name, address)
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapVerificationFromDB);
}

export async function deleteVerification(verificationId: string, storeId: string): Promise<void> {
  const { error } = await supabase.from('verifications').delete().eq('id', verificationId);

  if (error) throw error;

  // 가맹점 통계 재계산
  await updateStoreStats(storeId);
}

// ============ 후기 관리 ============

export interface CommentWithStore extends Comment {
  store?: {
    name: string;
    address: string;
  };
}

export async function getAllComments(): Promise<CommentWithStore[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      user:users(nickname, avatar_url),
      store:stores(name, address)
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapCommentFromDB);
}

export async function deleteCommentAdmin(commentId: string, storeId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) throw error;

  // 가맹점 통계 재계산
  await updateStoreStats(storeId);
}

// ============ 헬퍼 함수 ============

function mapUserFromDB(data: any): User {
  return {
    id: data.id,
    email: data.email,
    nickname: data.nickname,
    avatarUrl: data.avatar_url,
    trustLevel: data.trust_level || 1,
    totalRegistrations: data.total_registrations || 0,
    totalVerifications: data.total_verifications || 0,
    isAdmin: data.is_admin || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapStoreFromDB(data: any): Store {
  let lat = 0;
  let lng = 0;

  if (data.lat && data.lng) {
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);
  } else if (data.coordinates) {
    if (typeof data.coordinates === 'string') {
      const coordMatch = data.coordinates.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (coordMatch) {
        lng = parseFloat(coordMatch[1]);
        lat = parseFloat(coordMatch[2]);
      }
    } else if (typeof data.coordinates === 'object') {
      lat = data.coordinates.y || data.coordinates.lat || 0;
      lng = data.coordinates.x || data.coordinates.lng || 0;
    }
  }

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

function mapVerificationFromDB(data: any): VerificationWithStore {
  return {
    id: data.id,
    storeId: data.store_id,
    userId: data.user_id,
    isVerified: data.is_verified,
    comment: data.comment,
    evidenceImageUrl: data.evidence_image_url,
    createdAt: data.created_at,
    user: data.users
      ? {
          nickname: data.users.nickname,
          avatarUrl: data.users.avatar_url,
          trustLevel: data.users.trust_level,
        }
      : undefined,
    store: data.stores
      ? {
          name: data.stores.name,
          address: data.stores.address,
        }
      : undefined,
  };
}

function mapCommentFromDB(data: any): CommentWithStore {
  return {
    id: data.id,
    storeId: data.store_id,
    userId: data.user_id,
    content: data.content,
    rating: data.rating,
    paymentSuccess: data.payment_success,
    visitDate: data.visit_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    user: data.user
      ? {
          nickname: data.user.nickname,
          avatarUrl: data.user.avatar_url,
        }
      : undefined,
    store: data.store
      ? {
          name: data.store.name,
          address: data.store.address,
        }
      : undefined,
  };
}

// 가맹점 통계 업데이트 함수 (verification.ts에서 복사)
async function updateStoreStats(storeId: string): Promise<void> {
  const { data: verifications } = await supabase.from('verifications').select('is_verified').eq('store_id', storeId);

  const { data: comments } = await supabase
    .from('comments')
    .select('payment_success, rating')
    .eq('store_id', storeId)
    .not('payment_success', 'is', null);

  const vTotal = verifications?.length || 0;
  const vPositive = verifications?.filter(v => v.is_verified).length || 0;

  const cTotal = comments?.length || 0;
  const cPositive = comments?.filter(c => c.payment_success).length || 0;

  const total = vTotal + cTotal;
  const positive = vPositive + cPositive;
  const negative = total - positive;

  const trustScore = total > 0 ? Math.round((positive / total) * 100) : 50;

  await supabase
    .from('stores')
    .update({
      verification_count: total,
      positive_count: positive,
      negative_count: negative,
      trust_score: trustScore,
      last_verified_at: new Date().toISOString(),
    })
    .eq('id', storeId);
}
