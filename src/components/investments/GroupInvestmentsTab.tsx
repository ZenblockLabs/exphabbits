import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, User, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { GroupInvestment, GroupMember } from '@/hooks/useInvestmentGroups';

const THEME_PALETTES = [
  { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: '#10b981' },
  { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: '#3b82f6' },
  { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: '#8b5cf6' },
  { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: '#f59e0b' },
  { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/30', text: 'text-rose-400', accent: '#f43f5e' },
  { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: '#06b6d4' },
  { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400', accent: '#f97316' },
  { bg: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/30', text: 'text-indigo-400', accent: '#6366f1' },
];

interface Props {
  investments: GroupInvestment[];
  isCreator: boolean;
  onAdd: (data: { member_name: string; member_email?: string; amount: number; description?: string; invested_date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: { amount?: number; description?: string; invested_date?: string; member_name?: string }) => Promise<void>;
  members: GroupMember[];
}

interface PersonGroup {
  name: string;
  total: number;
  investments: GroupInvestment[];
}

interface EditState {
  id: string;
  amount: string;
  description: string;
  invested_date: string;
  member_name: string;
}

export const GroupInvestmentsTab: React.FC<Props> = ({ investments, isCreator, onAdd, onDelete, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ member_name: '', member_email: '', amount: '', description: '', invested_date: new Date().toISOString().split('T')[0] });
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);

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

  const startEdit = (inv: GroupInvestment) => {
    setEditing({
      id: inv.id,
      amount: String(inv.amount),
      description: inv.description || '',
      invested_date: inv.invested_date,
      member_name: inv.member_name,
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    await onUpdate(editing.id, {
      amount: parseFloat(editing.amount),
      description: editing.description || undefined,
      invested_date: editing.invested_date,
      member_name: editing.member_name,
    });
    setEditing(null);
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

  const grandTotal = groupedByPerson.reduce((s, p) => s + p.total, 0);

  const pieData = useMemo(() =>
    groupedByPerson.map((p, i) => ({
      name: p.name,
      value: p.total,
      color: THEME_PALETTES[i % THEME_PALETTES.length].accent,
    })),
    [groupedByPerson]
  );

  const togglePerson = (name: string) => {
    setExpandedPerson(prev => prev === name ? null : name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
      </Card>

      {groupedByPerson.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No investments yet.</p>
      ) : (
        <>
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investment Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatter.format(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Total Invested: <span className="font-bold text-foreground">{formatter.format(grandTotal)}</span>
              </p>
            </CardContent>
          </Card>

          {/* Person Boxes - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedByPerson.map((person, idx) => {
              const theme = THEME_PALETTES[idx % THEME_PALETTES.length];
              const isExpanded = expandedPerson === person.name;
              const sharePercent = grandTotal > 0 ? ((person.total / grandTotal) * 100).toFixed(1) : '0';

              return (
                <Card key={person.name} className={`bg-gradient-to-br ${theme.bg} ${theme.border} border overflow-hidden`}>
                  <Collapsible open={isExpanded} onOpenChange={() => togglePerson(person.name)}>
                    <CollapsibleTrigger asChild>
                      <div className="p-5 cursor-pointer hover:opacity-90 transition-opacity">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-background/20 flex items-center justify-center">
                              <User className={`w-5 h-5 ${theme.text}`} />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-base">{person.name}</p>
                              <p className="text-xs text-muted-foreground">{person.investments.length} contribution{person.investments.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="flex items-end justify-between">
                          <span className={`text-2xl font-bold ${theme.text}`}>{formatter.format(person.total)}</span>
                          <span className="text-xs text-muted-foreground">{sharePercent}% share</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t border-border/30 pt-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                             <TableHead>Name</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              {isCreator && <TableHead className="w-24 text-right">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {person.investments.map(inv => {
                              const isEditing = editing?.id === inv.id;

                              if (isEditing && editing) {
                                return (
                                  <TableRow key={inv.id}>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        className="h-8 w-24"
                                        value={editing.amount}
                                        onChange={e => setEditing({ ...editing, amount: e.target.value })}
                                      />
                                      <Input
                                        className="h-8 w-28 mt-1"
                                        value={editing.member_name}
                                        placeholder="Name"
                                        onChange={e => setEditing({ ...editing, member_name: e.target.value })}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="date"
                                        className="h-8 w-32"
                                        value={editing.invested_date}
                                        onChange={e => setEditing({ ...editing, invested_date: e.target.value })}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        className="h-8"
                                        value={editing.description}
                                        placeholder="Description"
                                        onChange={e => setEditing({ ...editing, description: e.target.value })}
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}>
                                          <Check className="w-4 h-4 text-green-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                                          <X className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              }

                              return (
                                <TableRow key={inv.id}>
                                  <TableCell className={`font-semibold ${theme.text}`}>{formatter.format(Number(inv.amount))}</TableCell>
                                  <TableCell>{new Date(inv.invested_date).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-muted-foreground">{inv.description || '-'}</TableCell>
                                  {isCreator && (
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(inv)}>
                                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(inv.id)}>
                                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
