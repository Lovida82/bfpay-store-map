import supabase from '../supabase';
import type { Comment, CommentCreateInput } from '@/types/verification';
import { updateStoreStats } from './verification';

export async function getCommentsByStoreId(storeId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(nickname, avatar_url)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapCommentFromDB);
}

export async function createComment(input: CommentCreateInput): Promise<Comment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      store_id: input.storeId,
      user_id: user.id,
      content: input.content,
      rating: input.rating,
      payment_success: input.paymentSuccess,
      visit_date: input.visitDate,
    })
    .select(`
      *,
      user:users(nickname, avatar_url)
    `)
    .single();

  if (error) throw error;

  // 결제 결과가 있으면 store 통계 업데이트
  if (input.paymentSuccess !== undefined) {
    await updateStoreStats(input.storeId);
  }

  return mapCommentFromDB(data);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

function mapCommentFromDB(data: any): Comment {
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
  };
}
