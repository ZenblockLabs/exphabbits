
-- Permission enum for group members
CREATE TYPE public.group_permission AS ENUM ('view', 'add_expense', 'add_investment', 'edit', 'admin');

-- Investment Groups
CREATE TABLE public.investment_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group Members with permissions
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.investment_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  permissions group_permission[] NOT NULL DEFAULT '{view}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, email)
);

-- Group Investments (contributions by members)
CREATE TABLE public.group_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.investment_groups(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_email TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  invested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group Expenses
CREATE TABLE public.group_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.investment_groups(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  spent_by TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_expenses ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a group (active or creator)
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.investment_groups WHERE id = _group_id AND created_by = _user_id
    UNION ALL
    SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id AND status = 'active'
  )
$$;

-- Helper: check if user has specific permission in a group
CREATE OR REPLACE FUNCTION public.has_group_permission(_user_id UUID, _group_id UUID, _permission group_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.investment_groups WHERE id = _group_id AND created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = _group_id AND user_id = _user_id AND status = 'active'
      AND (_permission = ANY(permissions) OR 'admin' = ANY(permissions))
  )
$$;

-- RLS: investment_groups
CREATE POLICY "Members can view their groups" ON public.investment_groups
  FOR SELECT TO authenticated
  USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create groups" ON public.investment_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can update" ON public.investment_groups
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Group creator can delete" ON public.investment_groups
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- RLS: group_members
CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group creator can manage members" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.investment_groups WHERE id = group_id AND created_by = auth.uid()));

CREATE POLICY "Group creator can update members" ON public.group_members
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investment_groups WHERE id = group_id AND created_by = auth.uid()));

CREATE POLICY "Group creator can remove members" ON public.group_members
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investment_groups WHERE id = group_id AND created_by = auth.uid()));

-- RLS: group_investments
CREATE POLICY "Members can view investments" ON public.group_investments
  FOR SELECT TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Permitted members can add investments" ON public.group_investments
  FOR INSERT TO authenticated
  WITH CHECK (public.has_group_permission(auth.uid(), group_id, 'add_investment'));

CREATE POLICY "Permitted members can edit investments" ON public.group_investments
  FOR UPDATE TO authenticated
  USING (public.has_group_permission(auth.uid(), group_id, 'edit'));

CREATE POLICY "Group creator can delete investments" ON public.group_investments
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investment_groups WHERE id = group_id AND created_by = auth.uid()));

-- RLS: group_expenses
CREATE POLICY "Members can view expenses" ON public.group_expenses
  FOR SELECT TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Permitted members can add expenses" ON public.group_expenses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_group_permission(auth.uid(), group_id, 'add_expense'));

CREATE POLICY "Permitted members can edit expenses" ON public.group_expenses
  FOR UPDATE TO authenticated
  USING (public.has_group_permission(auth.uid(), group_id, 'edit'));

CREATE POLICY "Group creator can delete expenses" ON public.group_expenses
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investment_groups WHERE id = group_id AND created_by = auth.uid()));

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for receipts
CREATE POLICY "Group members can upload receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Group members can view receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts');

-- Updated_at triggers
CREATE TRIGGER update_investment_groups_updated_at BEFORE UPDATE ON public.investment_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_investments_updated_at BEFORE UPDATE ON public.group_investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_expenses_updated_at BEFORE UPDATE ON public.group_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
