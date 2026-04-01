
DROP POLICY "Authenticated users can create groups" ON public.investment_groups;
CREATE POLICY "Authenticated users can create groups" ON public.investment_groups
  FOR INSERT TO authenticated
  WITH CHECK (true);
