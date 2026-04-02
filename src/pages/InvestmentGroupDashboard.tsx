import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Users, Receipt, PlusCircle, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroupDetails } from '@/hooks/useInvestmentGroups';
import { GroupMembersTab } from '@/components/investments/GroupMembersTab';
import { GroupInvestmentsTab } from '@/components/investments/GroupInvestmentsTab';
import { GroupExpensesTab } from '@/components/investments/GroupExpensesTab';
import { GroupActivityLog } from '@/components/investments/GroupActivityLog';
import { motion } from 'framer-motion';

const InvestmentGroupDashboard: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const details = useGroupDetails(groupId);
  const { group, members, investments, expenses, loading, isCreator, totalInvested, totalSpent, balance } = details;
  const [editingName, setEditingName] = useState(false);
  const [nameForm, setNameForm] = useState({ name: '', description: '' });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found or access denied.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/investments')}>Go Back</Button>
      </div>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active');
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const startEditName = () => {
    setNameForm({ name: group.name, description: group.description || '' });
    setEditingName(true);
  };

  const saveGroupName = async () => {
    if (!nameForm.name.trim()) return;
    await details.updateGroup({ name: nameForm.name.trim(), description: nameForm.description.trim() || undefined });
    setEditingName(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="space-y-1 flex-1">
              <Input value={nameForm.name} onChange={e => setNameForm(p => ({ ...p, name: e.target.value }))} placeholder="Group name" className="text-lg font-bold" />
              <Input value={nameForm.description} onChange={e => setNameForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className="text-sm" />
            </div>
            <Button variant="ghost" size="icon" onClick={saveGroupName}><Check className="w-4 h-4 text-green-500" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setEditingName(false)}><X className="w-4 h-4 text-muted-foreground" /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </div>
            {isCreator && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditName}>
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Total Invested', icon: <TrendingUp className="w-4 h-4 text-green-500" />, value: formatter.format(totalInvested), color: 'text-green-600', sub: `${investments.length} contributions` },
          { title: 'Total Spent', icon: <TrendingDown className="w-4 h-4 text-red-500" />, value: formatter.format(totalSpent), color: 'text-red-600', sub: `${expenses.length} expenses` },
          { title: 'Balance', icon: <Wallet className="w-4 h-4 text-primary" />, value: formatter.format(balance), color: balance >= 0 ? 'text-green-600' : 'text-red-600', sub: `${activeMembers.length + 1} members` },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.4, type: 'spring', stiffness: 120 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <motion.div
                  className={`text-2xl font-bold ${card.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.12 + 0.2, type: 'spring', stiffness: 200 }}
                >
                  {card.value}
                </motion.div>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <GroupActivityLog investments={investments} expenses={expenses} />
        </TabsContent>

        <TabsContent value="investments">
          <GroupInvestmentsTab
            investments={investments}
            isCreator={isCreator}
            onAdd={details.addInvestment}
            onDelete={details.deleteInvestment}
            onUpdate={details.updateInvestment}
            members={members}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <GroupExpensesTab
            expenses={expenses}
            isCreator={isCreator}
            onAdd={details.addExpense}
            onDelete={details.deleteExpense}
            onUpdate={details.updateExpense}
            onUploadReceipt={details.uploadReceipt}
            members={members}
          />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembersTab
            members={members}
            isCreator={isCreator}
            onAdd={details.addMember}
            onUpdatePermissions={details.updateMemberPermissions}
            onRemove={details.removeMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentGroupDashboard;
