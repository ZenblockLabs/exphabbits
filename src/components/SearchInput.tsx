import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useExpenses } from '@/contexts/ExpenseContext';
import { cn } from '@/lib/utils';

export const SearchInput: React.FC = () => {
  const { searchTerm, setSearchTerm } = useExpenses();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={cn(
        "relative w-full max-w-xs transition-all duration-300",
        isFocused && "max-w-sm"
      )}
    >
      <Search 
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} 
      />
      <Input
        type="search"
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-9 pr-8 h-10 bg-muted/40 border border-border/50 rounded-full transition-all duration-200",
          "placeholder:text-muted-foreground/60",
          "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 focus-visible:bg-background",
          "hover:bg-muted/60 hover:border-border"
        )}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
