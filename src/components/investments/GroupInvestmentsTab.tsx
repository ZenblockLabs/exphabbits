import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { GroupInvestment, GroupMember } from '@/hooks/useInvestmentGroups';

interface Props {
  investments: GroupInvestment[];
  isCreator: boolean;
  onAdd: (data: { member_name: string; member_email?: string; amount: number; description?: string; invested_date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  members: GroupMember[];
}

interface PersonGroup {
  name: string;
  total: number;
  investments: GroupInvestment[];
}

export const GroupInvestmentsTab: React.FC<Props> = ({ investments, isCreator, onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ member_name: '', member_email: '', amount: '', description: '', invested_date: new Date().toISOString().split('T')[0] });
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.member_name || !form.amount) return;
    await onAdd({
      member_name: form.member_name,
      member_email: form.member_email || undefined,
      amount: parseFloat(form.amount),
      description: form.description || undefined,
      invested_date: form.invested_date,
    });
    setForm({ member_name: '', member_email: '', amount: '', description: '', invested_date: new Date().toISOString().split('T')[0] });
    setOpen(false);
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const groupedByPerson = useMemo<PersonGroup[]>(() => {
    const map = new Map<string, GroupInvestment[]>();
    investments.forEach(inv => {
      const key = inv.member_name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    });
    return Array.from(map.entries()).map(([, invs]) => ({
      name: invs[0].member_name,
      total: invs.reduce((s, i) => s + Number(i.amount), 0),
      investments: invs.sort((a, b) => new Date(b.invested_date).getTime() - new Date(a.invested_date).getTime()),
    })).sort((a, b) => b.total - a.total);
  }, [investments]);

  const togglePerson = (name: string) => {
    setExpandedPerson(prev => prev === name ? null : name);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Investments</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Investment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Investment</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Person name *" value={form.member_name} onChange={e => setForm(p => ({ ...p, member_name: e.target.value }))} />
              <Input placeholder="Email (optional)" type="email" value={form.member_email} onChange={e => setForm(p => ({ ...p, member_email: e.target.value }))} />
              <Input placeholder="Amount *" type="number" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              <Input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <Input type="date" value={form.invested_date} onChange={e => setForm(p => ({ ...p, invested_date: e.target.value }))} />
              <Button onClick={handleSubmit} className="w-full" disabled={!form.member_name || !form.amount}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {groupedByPerson.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No investments yet.</p>
        ) : (
          <div className="space-y-3">
            {groupedByPerson.map(person => {
              const isExpanded = expandedPerson === person.name;
              return (
                <Card key={person.name} className="border bg-muted/30">
                  <Collapsible open={isExpanded} onOpenChange={() => togglePerson(person.name)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-t-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{person.name}</p>
                            <p className="text-xs text-muted-foreground">{person.investments.length} contribution{person.investments.length > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-green-600">{formatter.format(person.total)}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              {isCreator && <TableHead className="w-12" />}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {person.investments.map(inv => (
                              <TableRow key={inv.id}>
                                <TableCell className="text-green-600 font-semibold">{formatter.format(Number(inv.amount))}</TableCell>
                                <TableCell>{new Date(inv.invested_date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-muted-foreground">{inv.description || '-'}</TableCell>
                                {isCreator && (
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(inv.id)}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
