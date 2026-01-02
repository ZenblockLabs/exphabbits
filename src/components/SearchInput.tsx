import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useExpenses } from '@/contexts/ExpenseContext';

export const SearchInput: React.FC = () => {
  const { searchTerm, setSearchTerm } = useExpenses();

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search expenses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
      />
    </div>
  );
};
