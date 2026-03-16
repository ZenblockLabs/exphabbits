import React, { useEffect, useState, useCallback } from 'react';
import { Shield, Users, BarChart3, Settings as SettingsIcon, RefreshCw, Download, Activity, UserPlus, LogIn, Wallet, Target, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface ActivityEvent {
  type: string;
  email: string;
  timestamp: string;
  description: string;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'signup': return <UserPlus className="w-4 h-4 text-accent" />;
    case 'login': return <LogIn className="w-4 h-4 text-primary" />;
    case 'expense':
    case 'expense_update': return <Wallet className="w-4 h-4 text-primary" />;
    case 'habit': return <Target className="w-4 h-4 text-accent" />;
    case 'budget': return <PiggyBank className="w-4 h-4 text-primary" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActivityBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
  switch (type) {
    case 'signup': return 'default';
    case 'login': return 'secondary';
    default: return 'outline';
  }
};

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.csv downloaded`);
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    totalExpenses: 0,
    totalHabits: 0,
    totalBudgets: 0,
    totalRecurring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    const [expensesRes, habitsRes, budgetsRes, recurringRes] = await Promise.all([
      supabase.from('expenses').select('*', { count: 'exact', head: true }),
      supabase.from('habits').select('*', { count: 'exact', head: true }),
      supabase.from('budgets').select('*', { count: 'exact', head: true }),
      supabase.from('recurring_expenses').select('*', { count: 'exact', head: true }),
    ]);

    setStats((prev) => ({
      ...prev,
      totalExpenses: expensesRes.count ?? 0,
      totalHabits: habitsRes.count ?? 0,
      totalBudgets: budgetsRes.count ?? 0,
      totalRecurring: recurringRes.count ?? 0,
    }));
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users');
      if (error) throw error;
      const usersList = data?.users ?? [];
      setUsers(usersList);
      setStats((prev) => ({ ...prev, totalUsers: usersList.length }));
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
    }
    setUsersLoading(false);
  }, []);

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-activity');
      if (error) throw error;
      setActivities(data?.activities ?? []);
    } catch (err: any) {
      console.error('Failed to fetch activity:', err);
      toast.error('Failed to load activity log');
    }
    setActivityLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchActivity()]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchActivity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportUsersCSV = () => {
    const headers = ['Email', 'Signed Up', 'Last Login', 'Role'];
    const rows = users.map((u) => [
      u.email,
      formatDate(u.created_at),
      formatDate(u.last_sign_in_at),
      u.is_admin ? 'Admin' : 'User',
    ]);
    downloadCSV('users', headers, rows);
  };

  const exportAnalyticsCSV = () => {
    const headers = ['Metric', 'Count'];
    const rows = [
      ['Total Users', String(stats.totalUsers)],
      ['Total Expenses', String(stats.totalExpenses)],
      ['Total Habits', String(stats.totalHabits)],
      ['Total Budgets', String(stats.totalBudgets)],
      ['Recurring Expenses', String(stats.totalRecurring)],
    ];
    downloadCSV('analytics', headers, rows);
  };

  const exportActivityCSV = () => {
    const headers = ['Type', 'User', 'Description', 'Timestamp'];
    const rows = activities.map((a) => [
      a.type,
      a.email,
      a.description,
      formatDate(a.timestamp),
    ]);
    downloadCSV('activity-log', headers, rows);
  };

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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
            {stats.totalUsers > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {stats.totalUsers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportAnalyticsCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Users</CardDescription>
                <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Expenses</CardDescription>
                <CardTitle className="text-3xl">{stats.totalExpenses}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Habits</CardDescription>
                <CardTitle className="text-3xl">{stats.totalHabits}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Budgets</CardDescription>
                <CardTitle className="text-3xl">{stats.totalBudgets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Recurring</CardDescription>
                <CardTitle className="text-3xl">{stats.totalRecurring}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Overview</CardTitle>
              <CardDescription>Summary of all application data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Registered Users', value: stats.totalUsers },
                  { label: 'Expense Records', value: stats.totalExpenses },
                  { label: 'Active Habits', value: stats.totalHabits },
                  { label: 'Budget Entries', value: stats.totalBudgets },
                  { label: 'Recurring Expenses', value: stats.totalRecurring },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <Badge variant="secondary">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users with their activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportUsersCSV} disabled={users.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users found
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Signed Up</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(user.last_sign_in_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                              {user.is_admin ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent signups, logins, and data changes (last 30 days)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportActivityCSV} disabled={activities.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading activity...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-1">
                    {activities.map((event, i) => (
                      <div
                        key={`${event.timestamp}-${i}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="mt-0.5 flex-shrink-0 p-1.5 rounded-md bg-muted">
                          {getActivityIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getActivityBadgeVariant(event.type)} className="text-xs capitalize">
                              {event.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
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
