import supabase from '../supabase';
import type { Verification, VerificationCreateInput } from '@/types/verification';

export async function createVerification(input: VerificationCreateInput): Promise<Verification> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('verifications')
    .insert({
      store_id: input.storeId,
      user_id: user.id,
      is_verified: input.isVerified,
      comment: input.comment,
      evidence_image_url: input.evidenceImageUrl,
    })
    .select(
      `
      *,
      users:user_id (
        nickname,
        avatar_url,
        trust_level
      )
    `
    )
    .single();

  if (error) throw error;

  // 검증 후 store의 통계 업데이트
  await updateStoreStats(input.storeId);

  return mapVerificationFromDB(data);
}

// store의 검증 통계 업데이트 (검증 + 댓글 결제정보 포함)
export async function updateStoreStats(storeId: string): Promise<void> {
  // 해당 store의 모든 검증 조회
  const { data: verifications } = await supabase
    .from('verifications')
    .select('is_verified')
    .eq('store_id', storeId);

  // 해당 store의 모든 댓글 조회 (결제 결과가 있는 것만)
  const { data: comments } = await supabase
    .from('comments')
    .select('payment_success, rating')
    .eq('store_id', storeId)
    .not('payment_success', 'is', null);

  // 검증 데이터
  const vTotal = verifications?.length || 0;
  const vPositive = verifications?.filter(v => v.is_verified).length || 0;

  // 댓글 결제 데이터
  const cTotal = comments?.length || 0;
  const cPositive = comments?.filter(c => c.payment_success).length || 0;

  // 전체 통계
  const total = vTotal + cTotal;
  const positive = vPositive + cPositive;
  const negative = total - positive;

  // 신뢰도 계산: 긍정 비율 * 100 (데이터 없으면 50)
  const trustScore = total > 0 ? Math.round((positive / total) * 100) : 50;

  // store 업데이트
  const { error: updateError } = await supabase
    .from('stores')
    .update({
      verification_count: total,
      positive_count: positive,
      negative_count: negative,
      trust_score: trustScore,
      last_verified_at: new Date().toISOString(),
    })
    .eq('id', storeId);

  if (updateError) {
    console.error('Failed to update store stats:', updateError);
  }
}

export async function getVerificationsByStoreId(storeId: string): Promise<Verification[]> {
  const { data, error } = await supabase
    .from('verifications')
    .select(
      `
      *,
      users:user_id (
        nickname,
        avatar_url,
        trust_level
      )
    `
    )
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapVerificationFromDB);
}

export async function getMyVerifications(): Promise<Verification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapVerificationFromDB);
}

function mapVerificationFromDB(data: any): Verification {
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
  };
}
