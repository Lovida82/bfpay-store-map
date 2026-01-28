-- Categories reference table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO public.categories (name, icon, display_order) VALUES
    ('음식점', 'restaurant', 1),
    ('카페', 'cafe', 2),
    ('편의점', 'store', 3),
    ('마트', 'shopping_cart', 4),
    ('약국', 'pharmacy', 5),
    ('미용실', 'haircut', 6),
    ('병원', 'hospital', 7),
    ('주유소', 'gas_station', 8),
    ('기타', 'more', 99)
ON CONFLICT (name) DO NOTHING;

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    address_detail TEXT,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,
    sub_category TEXT,
    business_number TEXT,
    zeropay_supported BOOLEAN DEFAULT true,
    bipay_supported BOOLEAN DEFAULT true,
    trust_score DECIMAL(5,4) DEFAULT 0.5000 CHECK (trust_score BETWEEN 0 AND 1),
    verification_count INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'closed')),
    source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'ocr', 'excel', 'api')),
    source_image_url TEXT,
    registered_by UUID REFERENCES public.users(id),
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stores_coordinates ON public.stores USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_stores_category ON public.stores (category);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores (status);
CREATE INDEX IF NOT EXISTS idx_stores_trust_score ON public.stores (trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_stores_registered_by ON public.stores (registered_by);

-- Full text search index for Korean
CREATE INDEX IF NOT EXISTS idx_stores_name_search ON public.stores USING GIN (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_stores_address_search ON public.stores USING GIN (to_tsvector('simple', address));

-- RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stores"
    ON public.stores FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert stores"
    ON public.stores FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own stores"
    ON public.stores FOR UPDATE
    USING (auth.uid() = registered_by);
