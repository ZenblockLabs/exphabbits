// Layout component - v5 - with collapse and theme
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Menu, 
  X,
  Wallet,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Target,
  CheckSquare,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/SearchInput';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: { to: string; icon: React.ElementType; label: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Expenses',
    icon: Receipt,
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/months', icon: Calendar, label: 'Monthly View' },
      { to: '/add', icon: PlusCircle, label: 'Add Expense' },
    ],
  },
  {
    label: 'Habit Tracking',
    icon: Target,
    items: [
      { to: '/habits', icon: BarChart3, label: 'Dashboard' },
      { to: '/habits/add', icon: CheckSquare, label: 'Add Habit' },
    ],
  },
];

const VISIBILITY_STORAGE_KEY = 'sidebar-visibility-settings';
const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return saved === 'true';
  });
  const [openGroups, setOpenGroups] = useState<string[]>(['Expenses', 'Habit Tracking']);
  const [hiddenItems, setHiddenItems] = useState<string[]>(() => {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Save visibility settings to localStorage
  useEffect(() => {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(hiddenItems));
  }, [hiddenItems]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const closeSidebar = () => setSidebarOpen(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const toggleItemVisibility = (key: string) => {
    setHiddenItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isItemVisible = (key: string) => !hiddenItems.includes(key);

  // Filter visible items for each group
  const getVisibleItems = (group: NavGroup) => 
    group.items.filter(item => isItemVisible(item.to));

  // Find current page label for header
  const getCurrentPageLabel = () => {
    for (const group of navGroups) {
      const item = group.items.find((i) => i.to === location.pathname);
      if (item) return `${group.label} - ${item.label}`;
    }
    return 'Dashboard';
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen flex-shrink-0 transform transition-all duration-300 ease-in-out lg:translate-x-0",
          collapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground relative">
          {/* Collapse toggle button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>

          {/* Logo */}
          <div className={cn("p-4 flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display font-bold text-lg text-sidebar-foreground truncate">ExpenseFlow</h1>
                <p className="text-xs text-sidebar-foreground/60 truncate">Track your spending</p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={closeSidebar}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navGroups.map((group) => {
              const visibleItems = getVisibleItems(group);
              if (visibleItems.length === 0) return null;
              
              if (collapsed) {
                // Collapsed: show icons only with tooltips
                return (
                  <div key={group.label} className="space-y-1">
                    {visibleItems.map((item) => (
                      <Tooltip key={item.to}>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.to}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center justify-center w-full p-3 rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )
                            }
                          >
                            <item.icon className="w-5 h-5" />
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                );
              }

              return (
                <Collapsible
                  key={group.label}
                  open={openGroups.includes(group.label)}
                  onOpenChange={() => toggleGroup(group.label)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <group.icon className="w-5 h-5" />
                      {group.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openGroups.includes(group.label) && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 mt-1 space-y-1">
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="px-2 py-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center justify-center w-full p-3 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                        <Settings className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>
                ) : (
                  <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Theme Section */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Theme
                    </h4>
                    <div className="flex gap-2">
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                            theme === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          )}
                        >
                          <option.icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sidebar Collapse Section */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <PanelLeft className="w-4 h-4" />
                      Sidebar
                    </h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="collapse-sidebar" className="flex items-center gap-2 text-sm cursor-pointer">
                        {collapsed ? (
                          <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <PanelLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                        Collapse sidebar
                      </Label>
                      <Switch
                        id="collapse-sidebar"
                        checked={collapsed}
                        onCheckedChange={setCollapsed}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Menu Visibility Section */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Toggle which menu items are visible in the sidebar.
                    </p>
                    {navGroups.map((group, groupIndex) => (
                      <div key={group.label}>
                        {groupIndex > 0 && <Separator className="my-4" />}
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <group.icon className="w-4 h-4" />
                          {group.label}
                        </h4>
                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div key={item.to} className="flex items-center justify-between">
                              <Label 
                                htmlFor={`visibility-${item.to}`}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <item.icon className="w-4 h-4 text-muted-foreground" />
                                {item.label}
                              </Label>
                              <div className="flex items-center gap-2">
                                {isItemVisible(item.to) ? (
                                  <Eye className="w-4 h-4 text-muted-foreground" />
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
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Footer Stats - hide when collapsed */}
          {!collapsed && (
            <div className="p-4 m-2 rounded-xl bg-sidebar-accent">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-sidebar-primary" />
                <span className="text-xs font-medium text-sidebar-foreground/80">Quick Stats</span>
              </div>
              <p className="text-xs text-sidebar-foreground/60">
                Track and manage your expenses & habits.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden sm:block">
                <h2 className="font-display font-semibold text-lg">
                  {getCurrentPageLabel()}
                </h2>
              </div>
            </div>

            {/* Search */}
            <SearchInput />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};