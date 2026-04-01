import React, { useState } from 'react';
import { UserPlus, Shield, Eye, PenLine, Wallet, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { GroupMember } from '@/hooks/useInvestmentGroups';

const PERMISSION_OPTIONS = [
  { value: 'view', label: 'View', icon: Eye },
  { value: 'add_expense', label: 'Add Expense', icon: Wallet },
  { value: 'add_investment', label: 'Add Investment', icon: Wallet },
  { value: 'edit', label: 'Edit', icon: PenLine },
  { value: 'admin', label: 'Admin', icon: Shield },
];

interface Props {
  members: GroupMember[];
  isCreator: boolean;
  onAdd: (email: string, permissions: string[]) => Promise<void>;
  onUpdatePermissions: (memberId: string, permissions: string[]) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export const GroupMembersTab: React.FC<Props> = ({ members, isCreator, onAdd, onUpdatePermissions, onRemove }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [perms, setPerms] = useState<string[]>(['view']);

  const activeMembers = members.filter(m => m.status !== 'removed');

  const handleAdd = async () => {
    if (!email.trim()) return;
    await onAdd(email.trim().toLowerCase(), perms);
    setEmail('');
    setPerms(['view']);
    setOpen(false);
  };

  const togglePerm = (p: string) => {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Members</CardTitle>
        {isCreator && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="w-4 h-4 mr-2" /> Invite</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <div>
                  <p className="text-sm font-medium mb-2">Permissions</p>
                  <div className="space-y-2">
                    {PERMISSION_OPTIONS.map(p => (
                      <div key={p.value} className="flex items-center gap-2">
                        <Checkbox checked={perms.includes(p.value)} onCheckedChange={() => togglePerm(p.value)} id={p.value} />
                        <label htmlFor={p.value} className="text-sm flex items-center gap-1.5 cursor-pointer">
                          <p.icon className="w-3.5 h-3.5" /> {p.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full" disabled={!email.trim()}>Send Invite</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {activeMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No members yet. Invite someone to get started.</p>
        ) : (
          <div className="space-y-3">
            {activeMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-medium text-sm">{member.email}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {member.permissions.map(p => (
                      <Badge key={p} variant="secondary" className="text-xs">{p.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'outline'} className="mt-1 text-xs">
                    {member.status}
                  </Badge>
                </div>
                {isCreator && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                        <AlertDialogDescription>They will lose access to this group immediately.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(member.id)}>Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
