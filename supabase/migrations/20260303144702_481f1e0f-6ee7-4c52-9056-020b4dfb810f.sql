
-- Drop existing policies on habit_completions
DROP POLICY IF EXISTS "Users can view their own habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can create their own habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can update their own habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can delete their own habit_completions" ON public.habit_completions;

-- Recreate with explicit TO authenticated
CREATE POLICY "Users can view their own habit_completions"
ON public.habit_completions
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can create their own habit_completions"
ON public.habit_completions
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can update their own habit_completions"
ON public.habit_completions
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can delete their own habit_completions"
ON public.habit_completions
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));
