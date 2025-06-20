
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Star } from 'lucide-react';
import { Game } from '@/types/speedrun';

interface AdvancedSearchProps {
  games: Game[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (show: boolean) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  games,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedTags,
  onTagsChange,
  showFavoritesOnly,
  onFavoritesToggle
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate all possible search suggestions
  const allSuggestions = React.useMemo(() => {
    const suggestions = new Set<string>();
    
    games.forEach(game => {
      suggestions.add(game.title);
      game.tags.forEach(tag => suggestions.add(tag));
      game.categories.forEach(category => {
        suggestions.add(category.name);
        if (category.variables) {
          category.variables.split(',').forEach(variable => 
            suggestions.add(variable.trim())
          );
        }
      });
    });
    
    return Array.from(suggestions);
  }, [games]);

  // Get all unique tags
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    games.forEach(game => game.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [games]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, allSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            placeholder="Search games, categories, tags, variables..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10"
          />
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 z-20 mt-1 bg-background border shadow-lg animate-fade-in">
              <div className="p-2 max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded text-sm transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => onFavoritesToggle(!showFavoritesOnly)}
            className="transition-all"
          >
            <Star size={16} className={showFavoritesOnly ? "fill-current" : ""} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="transition-all"
          >
            <Filter size={16} />
          </Button>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="categories">Most Categories</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="placement">Best Placement</SelectItem>
              <SelectItem value="pbTime">Best PB Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4 animate-accordion-down">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Filter by Tags:</h4>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover-scale"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagsChange([])}
                className="h-8"
              >
                <X size={14} className="mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
