-- Verifications table
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    is_verified BOOLEAN NOT NULL,
    comment TEXT,
    evidence_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verifications_store ON public.verifications (store_id);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON public.verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created ON public.verifications (created_at DESC);

-- RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verifications"
    ON public.verifications FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add verifications"
    ON public.verifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
