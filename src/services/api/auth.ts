import supabase from '../supabase';
import type { User } from '@/types/user';

export async function signUp(email: string, password: string, nickname: string): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('회원가입에 실패했습니다');

  // 트리거가 자동으로 users 테이블에 추가하므로, 조회만 수행
  // 트리거 처리 대기를 위해 약간의 지연
  await new Promise(resolve => setTimeout(resolve, 500));

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', authData.user.id)
    .single();

  if (userError) {
    // 트리거가 아직 실행 안됐을 수 있으므로 수동 삽입 시도
    const { data: insertedData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        nickname,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return mapUserFromDB(insertedData);
  }

  // 닉네임 업데이트 (트리거가 기본값을 사용했을 수 있음)
  if (userData.nickname !== nickname) {
    const { data: updatedData } = await supabase
      .from('users')
      .update({ nickname })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (updatedData) return mapUserFromDB(updatedData);
  }

  return mapUserFromDB(userData);
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('로그인에 실패했습니다');

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError) throw userError;

  return mapUserFromDB(userData);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: userData, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  if (error) return null;

  return mapUserFromDB(userData);
}

export async function updateProfile(userId: string, profile: { nickname?: string; avatarUrl?: string }): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      nickname: profile.nickname,
      avatar_url: profile.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return mapUserFromDB(data);
}

function mapUserFromDB(data: any): User {
  return {
    id: data.id,
    email: data.email,
    nickname: data.nickname,
    avatarUrl: data.avatar_url,
    trustLevel: data.trust_level || 1,
    totalRegistrations: data.total_registrations || 0,
    totalVerifications: data.total_verifications || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
