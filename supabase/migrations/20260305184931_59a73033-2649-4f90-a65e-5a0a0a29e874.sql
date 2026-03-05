
ALTER TABLE public.user_pins 
ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;

CREATE OR REPLACE FUNCTION public.verify_pin(p_user_id uuid, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_locked_until timestamptz;
  v_failed_attempts int;
  v_is_valid boolean;
BEGIN
  -- Check lockout status
  SELECT failed_attempts, locked_until INTO v_failed_attempts, v_locked_until
  FROM public.user_pins WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If locked, check if lock has expired
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN FALSE;
  END IF;

  -- Verify PIN
  v_is_valid := EXISTS (
    SELECT 1 FROM public.user_pins
    WHERE user_id = p_user_id
      AND pin_hash = extensions.crypt(p_pin, pin_hash)
  );

  IF v_is_valid THEN
    -- Reset failed attempts on success
    UPDATE public.user_pins SET failed_attempts = 0, locked_until = NULL WHERE user_id = p_user_id;
    RETURN TRUE;
  ELSE
    -- Increment failed attempts
    UPDATE public.user_pins 
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END
    WHERE user_id = p_user_id;
    RETURN FALSE;
  END IF;
END;
$$;
