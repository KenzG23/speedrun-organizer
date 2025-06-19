
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}) => {
  return (
    <div className="flex space-x-4 mb-6">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alphabetical">A-Z</SelectItem>
          <SelectItem value="categories">Most Categories</SelectItem>
          <SelectItem value="recent">Recently Updated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
