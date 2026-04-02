import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Users, Receipt, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
          {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatter.format(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">{investments.length} contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatter.format(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatter.format(balance)}
            </div>
            <p className="text-xs text-muted-foreground">{activeMembers.length + 1} members</p>
          </CardContent>
        </Card>
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
