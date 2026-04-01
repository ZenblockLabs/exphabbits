import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupInvestment, GroupExpense } from '@/hooks/useInvestmentGroups';

interface Props {
  investments: GroupInvestment[];
  expenses: GroupExpense[];
}

export const GroupActivityLog: React.FC<Props> = ({ investments, expenses }) => {
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  // Combine and sort by date descending
  type LogItem = { type: 'investment' | 'expense'; date: string; amount: number; description: string; by: string; id: string };
  const items: LogItem[] = [
    ...investments.map(i => ({ type: 'investment' as const, date: i.invested_date, amount: Number(i.amount), description: i.description || 'Investment', by: i.member_name, id: i.id })),
    ...expenses.map(e => ({ type: 'expense' as const, date: e.expense_date, amount: Number(e.amount), description: e.description || e.category, by: e.spent_by, id: e.id })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 50).map(item => (
              <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'investment' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {item.type === 'investment' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">by {item.by} • {new Date(item.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ${
                  item.type === 'investment' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.type === 'investment' ? '+' : '-'}{formatter.format(item.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
