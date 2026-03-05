
-- Create extension for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create user_pins table
CREATE TABLE public.user_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own pin"
ON public.user_pins FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pin"
ON public.user_pins FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pin"
ON public.user_pins FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pin"
ON public.user_pins FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Function to verify PIN
CREATE OR REPLACE FUNCTION public.verify_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_pins
    WHERE user_id = p_user_id
      AND pin_hash = crypt(p_pin, pin_hash)
  );
END;
$$;

-- Function to set PIN (upsert)
CREATE OR REPLACE FUNCTION public.set_pin(p_pin TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_pins (user_id, pin_hash)
  VALUES (auth.uid(), crypt(p_pin, gen_salt('bf')))
  ON CONFLICT (user_id)
  DO UPDATE SET pin_hash = crypt(p_pin, gen_salt('bf')), updated_at = now();
END;
$$;
