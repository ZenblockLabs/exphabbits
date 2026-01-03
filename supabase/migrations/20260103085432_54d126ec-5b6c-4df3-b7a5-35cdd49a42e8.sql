-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring_expenses table
CREATE TABLE public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_applied TEXT,
  icon TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, category)
);

-- Create habits table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📌',
  color TEXT NOT NULL DEFAULT '#6366f1',
  target_days INTEGER NOT NULL DEFAULT 7,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);

-- Enable RLS on all tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Create public access policies for expenses
CREATE POLICY "Public read access for expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public insert access for expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete access for expenses" ON public.expenses FOR DELETE USING (true);

-- Create public access policies for recurring_expenses
CREATE POLICY "Public read access for recurring_expenses" ON public.recurring_expenses FOR SELECT USING (true);
CREATE POLICY "Public insert access for recurring_expenses" ON public.recurring_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for recurring_expenses" ON public.recurring_expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete access for recurring_expenses" ON public.recurring_expenses FOR DELETE USING (true);

-- Create public access policies for budgets
CREATE POLICY "Public read access for budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Public insert access for budgets" ON public.budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for budgets" ON public.budgets FOR UPDATE USING (true);
CREATE POLICY "Public delete access for budgets" ON public.budgets FOR DELETE USING (true);

-- Create public access policies for habits
CREATE POLICY "Public read access for habits" ON public.habits FOR SELECT USING (true);
CREATE POLICY "Public insert access for habits" ON public.habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for habits" ON public.habits FOR UPDATE USING (true);
CREATE POLICY "Public delete access for habits" ON public.habits FOR DELETE USING (true);

-- Create public access policies for habit_completions
CREATE POLICY "Public read access for habit_completions" ON public.habit_completions FOR SELECT USING (true);
CREATE POLICY "Public insert access for habit_completions" ON public.habit_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for habit_completions" ON public.habit_completions FOR UPDATE USING (true);
CREATE POLICY "Public delete access for habit_completions" ON public.habit_completions FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();