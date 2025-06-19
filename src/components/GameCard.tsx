
import React, { useState } from 'react';
import { Game, Category } from '@/types/speedrun';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, ExternalLink } from 'lucide-react';
import { CategoryForm } from './CategoryForm';

interface GameCardProps {
  game: Game;
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void;
  onDeleteGame: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onUpdateGame, onDeleteGame }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    
    onUpdateGame(game.id, {
      categories: [...game.categories, newCategory]
    });
    setShowCategoryForm(false);
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    const updatedCategories = game.categories.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    onUpdateGame(game.id, { categories: updatedCategories });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = game.categories.filter(cat => cat.id !== categoryId);
    onUpdateGame(game.id, { categories: updatedCategories });
  };

  return (
    <>
      <Card className="w-full mb-4 transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img
                src={game.image || '/placeholder.svg'}
                alt={game.title}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate">{game.title}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {game.categories.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteGame(game.id)}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-3">
            {game.categories.map(category => (
              <div key={category.id} className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                  <div>Placement: {category.placement}</div>
                  <div>PB: {category.pbTime}</div>
                  {category.placement > 1 && (
                    <>
                      <div>To Beat: {category.timeToBeat}</div>
                      <div>Difference: {category.timeDifference}</div>
                    </>
                  )}
                </div>
                
                {category.videoLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => window.open(category.videoLink, '_blank')}
                  >
                    <ExternalLink size={12} className="mr-1" />
                    Video
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCategoryForm(true)}
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </Button>
          </CardContent>
        )}
      </Card>

      {(showCategoryForm || editingCategory) && (
        <CategoryForm
          category={editingCategory || undefined}
          onSave={editingCategory ? 
            (updates) => handleUpdateCategory(editingCategory.id, updates) : 
            handleAddCategory
          }
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </>
  );
};
