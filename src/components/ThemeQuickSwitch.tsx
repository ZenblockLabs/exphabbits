import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ThemeQuickSwitch: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleThemeChange = (checked: boolean) => {
    const nextTheme = checked ? 'dark' : 'light';
    localStorage.setItem('habex-theme', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-10 items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            aria-label="Toggle dark mode"
            checked={isDark}
            onCheckedChange={handleThemeChange}
            className="scale-90"
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</TooltipContent>
    </Tooltip>
  );
};
