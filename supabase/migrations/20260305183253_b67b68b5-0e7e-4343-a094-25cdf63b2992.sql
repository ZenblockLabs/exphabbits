
CREATE OR REPLACE FUNCTION public.set_pin(p_pin text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_pins (user_id, pin_hash)
  VALUES (auth.uid(), extensions.crypt(p_pin, extensions.gen_salt('bf')))
  ON CONFLICT (user_id)
  DO UPDATE SET pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')), updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_pin(p_user_id uuid, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_pins
    WHERE user_id = p_user_id
      AND pin_hash = extensions.crypt(p_pin, pin_hash)
  );
END;
$$;
