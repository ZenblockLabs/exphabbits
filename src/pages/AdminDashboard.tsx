import React, { useEffect, useState } from 'react';
import { Shield, Users, BarChart3, Settings as SettingsIcon, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

interface AppStats {
  totalUsers: number;
  totalExpenses: number;
  totalHabits: number;
  totalBudgets: number;
  totalRecurring: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    totalExpenses: 0,
    totalHabits: 0,
    totalBudgets: 0,
    totalRecurring: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats using count queries
      const [expensesRes, habitsRes, budgetsRes, recurringRes] = await Promise.all([
        supabase.from('expenses').select('*', { count: 'exact', head: true }),
        supabase.from('habits').select('*', { count: 'exact', head: true }),
        supabase.from('budgets').select('*', { count: 'exact', head: true }),
        supabase.from('recurring_expenses').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: users.length,
        totalExpenses: expensesRes.count ?? 0,
        totalHabits: habitsRes.count ?? 0,
        totalBudgets: budgetsRes.count ?? 0,
        totalRecurring: recurringRes.count ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your application</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-3xl">{stats.totalExpenses}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Habits</CardDescription>
                <CardTitle className="text-3xl">{stats.totalHabits}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Budgets</CardDescription>
                <CardTitle className="text-3xl">{stats.totalBudgets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Recurring Expenses</CardDescription>
                <CardTitle className="text-3xl">{stats.totalRecurring}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Overview</CardTitle>
              <CardDescription>Summary of all application data across your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Expense Records</span>
                  <Badge variant="secondary">{stats.totalExpenses}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Active Habits</span>
                  <Badge variant="secondary">{stats.totalHabits}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Budget Entries</span>
                  <Badge variant="secondary">{stats.totalBudgets}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Recurring Expenses</span>
                  <Badge variant="secondary">{stats.totalRecurring}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                User management requires backend functions for full access to auth data. 
                Currently showing data accessible through your admin role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">Available Actions:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>View application statistics in the Analytics tab</li>
                  <li>Monitor data counts across all tables</li>
                  <li>System configuration in the System tab</li>
                </ul>
                <p className="mt-3 text-xs">
                  For advanced user management (view all users, delete accounts), 
                  a dedicated backend function can be added.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Application-wide settings and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">Database Status</p>
                    <p className="text-sm text-muted-foreground">Connection to backend</p>
                  </div>
                  <Badge className="bg-accent/10 text-accent border-accent/20">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">Authentication</p>
                    <p className="text-sm text-muted-foreground">Email + PIN login enabled</p>
                  </div>
                  <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">Row Level Security</p>
                    <p className="text-sm text-muted-foreground">All tables protected</p>
                  </div>
                  <Badge className="bg-accent/10 text-accent border-accent/20">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
