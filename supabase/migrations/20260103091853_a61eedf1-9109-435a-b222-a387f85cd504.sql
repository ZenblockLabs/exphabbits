-- Add user_id column to expenses table
ALTER TABLE public.expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to recurring_expenses table  
ALTER TABLE public.recurring_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to budgets table
ALTER TABLE public.budgets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to habits table
ALTER TABLE public.habits ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public policies for expenses
DROP POLICY IF EXISTS "Public read access for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public insert access for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public update access for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public delete access for expenses" ON public.expenses;

-- Drop existing public policies for recurring_expenses
DROP POLICY IF EXISTS "Public read access for recurring_expenses" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Public insert access for recurring_expenses" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Public update access for recurring_expenses" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Public delete access for recurring_expenses" ON public.recurring_expenses;

-- Drop existing public policies for budgets
DROP POLICY IF EXISTS "Public read access for budgets" ON public.budgets;
DROP POLICY IF EXISTS "Public insert access for budgets" ON public.budgets;
DROP POLICY IF EXISTS "Public update access for budgets" ON public.budgets;
DROP POLICY IF EXISTS "Public delete access for budgets" ON public.budgets;

-- Drop existing public policies for habits
DROP POLICY IF EXISTS "Public read access for habits" ON public.habits;
DROP POLICY IF EXISTS "Public insert access for habits" ON public.habits;
DROP POLICY IF EXISTS "Public update access for habits" ON public.habits;
DROP POLICY IF EXISTS "Public delete access for habits" ON public.habits;

-- Drop existing public policies for habit_completions
DROP POLICY IF EXISTS "Public read access for habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Public insert access for habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Public update access for habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Public delete access for habit_completions" ON public.habit_completions;

-- Create user-specific RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user-specific RLS policies for recurring_expenses
CREATE POLICY "Users can view their own recurring_expenses" ON public.recurring_expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring_expenses" ON public.recurring_expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring_expenses" ON public.recurring_expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring_expenses" ON public.recurring_expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user-specific RLS policies for budgets
CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budgets" ON public.budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user-specific RLS policies for habits
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user-specific RLS policies for habit_completions (via habit ownership)
CREATE POLICY "Users can view their own habit_completions" ON public.habit_completions FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can create their own habit_completions" ON public.habit_completions FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can update their own habit_completions" ON public.habit_completions FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can delete their own habit_completions" ON public.habit_completions FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));

-- Update unique constraint on budgets to include user_id
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_year_category_key;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_year_category_user_key UNIQUE(year, category, user_id);