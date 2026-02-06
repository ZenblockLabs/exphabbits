import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Copy, Check, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDates: string[];
  category?: string;
}

interface StreakInfo {
  habitName: string;
  habitIcon: string;
  currentStreak: number;
  bestStreak: number;
}

interface HeatmapExportShareProps {
  heatmapRef: React.RefObject<HTMLDivElement>;
  habits: Habit[];
}

const HeatmapExportShare: React.FC<HeatmapExportShareProps> = ({ heatmapRef, habits }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate streak info for each habit
  const calculateStreaks = (): StreakInfo[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habits.map(habit => {
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      // Sort dates in descending order
      const sortedDates = [...habit.completedDates].sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      // Calculate current streak (from today backwards)
      const todayStr = today.toISOString().split('T')[0];
      let checkDate = new Date(today);
      
      // Check if completed today or yesterday (allow for ongoing streaks)
      const hasToday = sortedDates.includes(todayStr);
      if (!hasToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (sortedDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate best streak
      if (sortedDates.length > 0) {
        const allDates = sortedDates.map(d => new Date(d).getTime()).sort((a, b) => a - b);
        tempStreak = 1;
        bestStreak = 1;

        for (let i = 1; i < allDates.length; i++) {
          const diff = (allDates[i] - allDates[i - 1]) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
      }

      return {
        habitName: habit.name,
        habitIcon: habit.icon,
        currentStreak,
        bestStreak,
      };
    }).sort((a, b) => b.currentStreak - a.currentStreak);
  };

  const exportAsImage = async () => {
    if (!heatmapRef.current) {
      toast.error('Heatmap not found');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await toPng(heatmapRef.current, {
        backgroundColor: 'hsl(var(--background))',
        pixelRatio: 2,
        cacheBust: true,
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `habit-heatmap-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Heatmap exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export heatmap');
    } finally {
      setIsExporting(false);
    }
  };

  const generateStreakSummary = (): string => {
    const streaks = calculateStreaks();
    const today = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    let summary = `🔥 My Habit Streaks - ${today}\n\n`;
    
    const activeStreaks = streaks.filter(s => s.currentStreak > 0);
    if (activeStreaks.length > 0) {
      summary += `Active Streaks:\n`;
      activeStreaks.forEach(s => {
        summary += `${s.habitIcon} ${s.habitName}: ${s.currentStreak} day${s.currentStreak !== 1 ? 's' : ''}\n`;
      });
    }

    const topStreak = streaks.reduce((max, s) => s.bestStreak > max.bestStreak ? s : max, streaks[0]);
    if (topStreak && topStreak.bestStreak > 0) {
      summary += `\n🏆 Best Ever: ${topStreak.habitIcon} ${topStreak.habitName} - ${topStreak.bestStreak} days`;
    }

    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    summary += `\n\n📊 Total Completions: ${totalCompletions}`;
    summary += `\n\nBuilt with Habex ✨`;

    return summary;
  };

  const copyStreakSummary = async () => {
    const summary = generateStreakSummary();
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Streak summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy summary');
    }
  };

  const shareStreakSummary = async () => {
    const summary = generateStreakSummary();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Habit Streaks',
          text: summary,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy
      await copyStreakSummary();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Export & Share</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={exportAsImage}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Download as Image'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={copyStreakSummary}
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy Streak Summary
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareStreakSummary}
          className="cursor-pointer"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Streak Summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeatmapExportShare;
