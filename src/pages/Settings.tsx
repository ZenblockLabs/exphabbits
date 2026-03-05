import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor,
  PanelLeft,
  PanelLeftClose,
  Eye,
  EyeOff,
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Receipt,
  Target,
  BarChart3,
  CheckSquare,
  Flame,
  User,
  BookOpen,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Lock,
  KeyRound,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BADGE_SOUND_ENABLED_KEY } from '@/hooks/useBadgeSound';
import { PinSetup } from '@/components/PinSetup';

const VISIBILITY_STORAGE_KEY = 'sidebar-visibility-settings';
const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed';

const navGroups = [
  {
    label: 'Expenses',
    icon: Receipt,
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/months', icon: Calendar, label: 'Monthly View' },
      { to: '/add', icon: PlusCircle, label: 'Add Expense' },
      { to: '/recurring', icon: RefreshCw, label: 'Recurring' },
    ],
  },
  {
    label: 'Habit Tracking',
    icon: Target,
    items: [
      { to: '/habits', icon: BarChart3, label: 'Dashboard' },
      { to: '/habits/add', icon: CheckSquare, label: 'Add Habit' },
      { to: '/habits/challenge', icon: Flame, label: '21 Days Challenge' },
    ],
  },
  {
    label: 'Personal',
    icon: User,
    items: [
      { to: '/notebook', icon: BookOpen, label: 'Notebook' },
    ],
  },
];

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return saved === 'true';
  });

  const [hiddenItems, setHiddenItems] = useState<string[]>(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Badge sound setting
  const [badgeSoundEnabled, setBadgeSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(BADGE_SOUND_ENABLED_KEY);
    return saved !== 'false'; // Default to true
  });

  const handleBadgeSoundChange = (enabled: boolean) => {
    setBadgeSoundEnabled(enabled);
    localStorage.setItem(BADGE_SOUND_ENABLED_KEY, String(enabled));
    window.dispatchEvent(new Event('storage'));
  };
  const resetDialog = () => {
    setConfirmText('');
    setPassword('');
    setPasswordError('');
  };

  const resetPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordChangeError('');
  };

  const handleChangePassword = async () => {
    setPasswordChangeError('');

    if (!currentPassword.trim()) {
      setPasswordChangeError('Current password is required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    if (!user?.email) {
      toast.error('Unable to verify account');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Verify current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (authError) {
        setPasswordChangeError('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordChangeError(updateError.message);
        setIsChangingPassword(false);
        return;
      }

      toast.success('Password changed successfully');
      setPasswordDialogOpen(false);
      resetPasswordDialog();
    } catch (error) {
      setPasswordChangeError('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    if (!user?.email) {
      toast.error('Unable to verify account');
      return;
    }

    setIsDeleting(true);
    setPasswordError('');

    try {
      // Verify password by attempting to sign in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (authError) {
        setPasswordError('Incorrect password');
        setIsDeleting(false);
        return;
      }

      // Delete user data from all tables
      await Promise.all([
        supabase.from('habits').delete().eq('user_id', user.id),
        supabase.from('expenses').delete().eq('user_id', user.id),
        supabase.from('budgets').delete().eq('user_id', user.id),
        supabase.from('recurring_expenses').delete().eq('user_id', user.id),
      ]);

      // Sign out and notify user
      await signOut();
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success('Account data deleted. Please contact support to complete account removal.');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
      resetDialog();
    }
  };

  const handleCollapseChange = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(value));
    // Trigger storage event for Layout to pick up
    window.dispatchEvent(new Event('storage'));
  };

  const toggleItemVisibility = (key: string) => {
    const newHiddenItems = hiddenItems.includes(key) 
      ? hiddenItems.filter(k => k !== key) 
      : [...hiddenItems, key];
    setHiddenItems(newHiddenItems);
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(newHiddenItems));
    window.dispatchEvent(new Event('storage'));
  };

  const isItemVisible = (key: string) => !hiddenItems.includes(key);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your app experience</p>
      </div>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sun className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  theme === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                <option.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PanelLeft className="w-5 h-5" />
            Sidebar
          </CardTitle>
          <CardDescription>Configure sidebar behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <Label htmlFor="collapse-sidebar" className="flex items-center gap-3 text-sm cursor-pointer">
              {collapsed ? (
                <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
              ) : (
                <PanelLeft className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Collapse sidebar</p>
                <p className="text-xs text-muted-foreground">Show icons only to save space</p>
              </div>
            </Label>
            <Switch
              id="collapse-sidebar"
              checked={collapsed}
              onCheckedChange={handleCollapseChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="w-5 h-5" />
            Sound
          </CardTitle>
          <CardDescription>Configure sound effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <Label htmlFor="badge-sound" className="flex items-center gap-3 text-sm cursor-pointer">
              {badgeSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Badge unlock sound</p>
                <p className="text-xs text-muted-foreground">Play a sound when you unlock a new badge</p>
              </div>
            </Label>
            <Switch
              id="badge-sound"
              checked={badgeSoundEnabled}
              onCheckedChange={handleBadgeSoundChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Visibility Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Menu Visibility
          </CardTitle>
          <CardDescription>Toggle which menu items appear in the sidebar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && <Separator className="mb-6" />}
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <group.icon className="w-4 h-4 text-primary" />
                {group.label}
              </h4>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div 
                    key={item.to} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Label 
                      htmlFor={`visibility-${item.to}`}
                      className="flex items-center gap-3 text-sm cursor-pointer flex-1"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      {item.label}
                    </Label>
                    <div className="flex items-center gap-3">
                      {isItemVisible(item.to) ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        id={`visibility-${item.to}`}
                        checked={isItemVisible(item.to)}
                        onCheckedChange={() => toggleItemVisibility(item.to)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick PIN Login */}
      <PinSetup />

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">
                Update your account password
              </p>
            </div>
            <AlertDialog open={passwordDialogOpen} onOpenChange={(open) => {
              setPasswordDialogOpen(open);
              if (!open) resetPasswordDialog();
            }}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    Change Password
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter your current password and choose a new one.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPasswordChangeError('');
                          }}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium">
                          New Password
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordChangeError('');
                          }}
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password" className="text-sm font-medium">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-new-password"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            setPasswordChangeError('');
                          }}
                          placeholder="Confirm new password"
                        />
                      </div>
                      {passwordChangeError && (
                        <p className="text-sm text-destructive">{passwordChangeError}</p>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={resetPasswordDialog}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    onClick={handleChangePassword}
                    disabled={!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim() || isChangingPassword}
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This action is <strong className="text-foreground">irreversible</strong>. All your data including habits, 
                        expenses, and budgets will be permanently deleted.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Enter your password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError('');
                          }}
                          placeholder="Your password"
                          className={passwordError ? 'border-destructive' : ''}
                        />
                        {passwordError && (
                          <p className="text-xs text-destructive">{passwordError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-delete" className="text-sm font-medium">
                          Type <span className="font-mono text-destructive">DELETE</span> to confirm
                        </Label>
                        <Input
                          id="confirm-delete"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Type DELETE"
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={resetDialog}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== 'DELETE' || !password.trim() || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;