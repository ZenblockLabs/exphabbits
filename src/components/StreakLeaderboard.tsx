import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, Star, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit } from '@/contexts/HabitContext';
import { format } from 'date-fns';

interface StreakLeaderboardProps {
  habits: Habit[];
  iconMap: Record<string, React.ElementType>;
}

const StreakLeaderboard: React.FC<StreakLeaderboardProps> = ({ habits, iconMap }) => {
  // Calculate streak for each habit
  const calculateHabitStreak = (habit: Habit) => {
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const rankedHabits = habits
    .map((habit) => ({
      ...habit,
      streak: calculateHabitStreak(habit),
    }))
    .sort((a, b) => b.streak - a.streak);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank + 1}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-muted/30 border-border';
    }
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 100) {
      return {
        icon: <Trophy className="h-3.5 w-3.5" />,
        className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      };
    } else if (streak >= 30) {
      return {
        icon: <Star className="h-3.5 w-3.5" />,
        className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      };
    } else if (streak >= 7) {
      return {
        icon: <Zap className="h-3.5 w-3.5" />,
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      };
    } else if (streak > 0) {
      return {
        icon: <Flame className="h-3.5 w-3.5" />,
        className: 'bg-orange-500/20 text-orange-600',
      };
    }
    return {
      icon: null,
      className: 'bg-muted text-muted-foreground',
    };
  };

  if (habits.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Streak Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankedHabits.map((habit, index) => {
          const IconComponent = iconMap[habit.icon] || Target;
          const streakBadge = getStreakBadge(habit.streak);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(index)}`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(index)}
              </div>
              
              <div
                className="p-1.5 rounded-md flex-shrink-0"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                <IconComponent
                  className="h-4 w-4"
                  style={{ color: habit.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {habit.name}
                </p>
              </div>
              
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${streakBadge.className}`}
              >
                {streakBadge.icon}
                <span>{habit.streak} days</span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default StreakLeaderboard;
