
DROP POLICY "Members can view their groups" ON public.investment_groups;

CREATE POLICY "Creator can view their groups" ON public.investment_groups
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Members can view their groups" ON public.investment_groups
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = investment_groups.id 
      AND user_id = auth.uid() 
      AND status = 'active'
  ));
