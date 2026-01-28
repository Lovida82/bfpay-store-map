-- Function to get stores within radius
CREATE OR REPLACE FUNCTION get_stores_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 1000,
    category_filter TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT 'verified'
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    category TEXT,
    trust_score DECIMAL,
    distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.address,
        ST_Y(s.coordinates::geometry) as lat,
        ST_X(s.coordinates::geometry) as lng,
        s.category,
        s.trust_score,
        ST_Distance(
            s.coordinates,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
        ) as distance_meters
    FROM public.stores s
    WHERE ST_DWithin(
        s.coordinates,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_meters
    )
    AND (category_filter IS NULL OR s.category = category_filter)
    AND (status_filter IS NULL OR s.status = status_filter)
    ORDER BY distance_meters ASC;
END;
$$;

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_store_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_positive INTEGER;
    v_negative INTEGER;
    v_total INTEGER;
    v_score DECIMAL;
BEGIN
    -- Count verifications
    SELECT
        COALESCE(SUM(CASE WHEN is_verified THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN NOT is_verified THEN 1 ELSE 0 END), 0)
    INTO v_positive, v_negative
    FROM public.verifications
    WHERE store_id = p_store_id;

    v_total := v_positive + v_negative;

    -- Wilson score interval (simplified)
    IF v_total = 0 THEN
        v_score := 0.50;
    ELSE
        v_score := (v_positive + 1.9208) / (v_total + 3.8416);
    END IF;

    -- Update store
    UPDATE public.stores
    SET
        trust_score = v_score,
        verification_count = v_total,
        positive_count = v_positive,
        negative_count = v_negative,
        status = CASE
            WHEN v_total >= 3 AND v_score >= 0.7 THEN 'verified'
            WHEN v_total >= 3 AND v_score < 0.3 THEN 'rejected'
            ELSE status
        END,
        last_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = p_store_id;

    RETURN v_score;
END;
$$;

-- Trigger function after verification insert
CREATE OR REPLACE FUNCTION after_verification_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Recalculate trust score
    PERFORM calculate_trust_score(NEW.store_id);

    -- Update user stats
    UPDATE public.users
    SET
        total_verifications = total_verifications + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$;

-- Trigger after verification
DROP TRIGGER IF EXISTS trigger_after_verification ON public.verifications;
CREATE TRIGGER trigger_after_verification
    AFTER INSERT ON public.verifications
    FOR EACH ROW
    EXECUTE FUNCTION after_verification_insert();

-- Trigger function after store insert
CREATE OR REPLACE FUNCTION after_store_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update user registration count
    UPDATE public.users
    SET
        total_registrations = total_registrations + 1,
        updated_at = NOW()
    WHERE id = NEW.registered_by;

    RETURN NEW;
END;
$$;

-- Trigger after store insert
DROP TRIGGER IF EXISTS trigger_after_store_insert ON public.stores;
CREATE TRIGGER trigger_after_store_insert
    AFTER INSERT ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION after_store_insert();
