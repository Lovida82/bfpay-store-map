-- users 테이블에 is_admin 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 특정 이메일에 관리자 권한 부여
UPDATE public.users
SET is_admin = true
WHERE email = 'jsw0504@ajupharm.co.kr';

-- 기존 RLS 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete any store" ON public.stores;
DROP POLICY IF EXISTS "Admins can update any store" ON public.stores;
DROP POLICY IF EXISTS "Admins can delete verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

-- 관리자용 RLS 정책 추가

-- 관리자만 모든 사용자 수정 가능
CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 관리자만 가맹점 삭제 가능
CREATE POLICY "Admins can delete any store"
    ON public.stores FOR DELETE
    USING (
        auth.uid() = registered_by OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 관리자만 모든 가맹점 수정 가능
CREATE POLICY "Admins can update any store"
    ON public.stores FOR UPDATE
    USING (
        auth.uid() = registered_by OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 관리자만 검증 삭제 가능
CREATE POLICY "Admins can delete verifications"
    ON public.verifications FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 관리자만 댓글 삭제 가능
CREATE POLICY "Admins can delete any comment"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );
