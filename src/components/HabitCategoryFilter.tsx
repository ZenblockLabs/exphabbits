import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HABIT_CATEGORIES, HabitCategory } from '@/contexts/HabitContext';

interface HabitCategoryFilterProps {
  selectedCategory: HabitCategory | 'all';
  onCategoryChange: (category: HabitCategory | 'all') => void;
}

const HabitCategoryFilter: React.FC<HabitCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex items-center gap-1">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          All
        </Button>
        {HABIT_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange(cat.value)}
            className="h-7 px-3 text-xs whitespace-nowrap"
          >
            <span
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default HabitCategoryFilter;
