import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { GroupExpense, GroupMember } from '@/hooks/useInvestmentGroups';

const EXPENSE_CATEGORIES = [
  'Equipment', 'Materials', 'Marketing', 'Travel', 'Food', 'Rent', 'Utilities', 'Salary', 'Miscellaneous', 'Other'
];

interface Props {
  expenses: GroupExpense[];
  isCreator: boolean;
  onAdd: (data: { amount: number; category: string; spent_by: string; description?: string; expense_date: string; receipt_url?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUploadReceipt: (file: File) => Promise<string | null>;
  members: GroupMember[];
}

export const GroupExpensesTab: React.FC<Props> = ({ expenses, isCreator, onAdd, onDelete, onUploadReceipt }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', category: '', spent_by: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await onUploadReceipt(file);
    setReceiptUrl(url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.category || !form.spent_by) return;
    await onAdd({
      amount: parseFloat(form.amount),
      category: form.category,
      spent_by: form.spent_by,
      description: form.description || undefined,
      expense_date: form.expense_date,
      receipt_url: receiptUrl || undefined,
    });
    setForm({ amount: '', category: '', spent_by: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setReceiptUrl(null);
    setOpen(false);
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Expenses</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Shared Expense</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Amount *" type="number" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Who spent it *" value={form.spent_by} onChange={e => setForm(p => ({ ...p, spent_by: e.target.value }))} />
              <Input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <Input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} />
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : receiptUrl ? 'Receipt attached ✓' : 'Attach Receipt'}
                </Button>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.amount || !form.category || !form.spent_by}>Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No expenses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Spent By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Receipt</TableHead>
                  {isCreator && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell><Badge variant="outline">{exp.category}</Badge></TableCell>
                    <TableCell className="text-red-600 font-semibold">{formatter.format(Number(exp.amount))}</TableCell>
                    <TableCell>{exp.spent_by}</TableCell>
                    <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{exp.description || '-'}</TableCell>
                    <TableCell>
                      {exp.receipt_url ? (
                        <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </a>
                      ) : '-'}
                    </TableCell>
                    {isCreator && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(exp.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
