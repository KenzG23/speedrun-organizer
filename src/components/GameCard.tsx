
import React, { useState } from 'react';
import { Game, Category } from '@/types/speedrun';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from 'lucide-react';
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
    <Card className="w-full mb-4 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={game.image || '/placeholder.svg'}
              alt={game.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <CardTitle className="text-lg">{game.title}</CardTitle>
              <div className="flex gap-1 mt-1">
                {game.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{game.categories.length} categories</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteGame(game.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {game.categories.map(category => (
              <div key={category.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Placement: {category.placement}</div>
                  <div>PB: {category.pbTime}</div>
                  <div>To Beat: {category.timeToBeat}</div>
                  <div>Difference: {category.timeDifference}</div>
                </div>
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
          </div>

          {(showCategoryForm || editingCategory) && (
            <CategoryForm
              category={editingCategory}
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
        </CardContent>
      )}
    </Card>
  );
};
