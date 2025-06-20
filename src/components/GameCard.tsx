
import React, { useState } from 'react';
import { Game, Category } from '@/types/speedrun';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, ExternalLink, Star, Copy, Timer, GripVertical } from 'lucide-react';
import { CategoryForm } from './CategoryForm';
import { GameForm } from './GameForm';

interface GameCardProps {
  game: Game;
  onUpdateGame: (gameId: string, updates: Partial<Game>) => void;
  onDeleteGame: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onUpdateGame, onDeleteGame }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

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

  const handleDuplicateCategory = (category: Category) => {
    const duplicatedCategory: Category = {
      ...category,
      id: Date.now().toString(),
      name: `${category.name} (Copy)`,
      pbTime: '',
      dateOfRun: '',
      placement: 1
    };
    
    onUpdateGame(game.id, {
      categories: [...game.categories, duplicatedCategory]
    });
  };

  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory === targetCategoryId) {
      setDraggedCategory(null);
      return;
    }

    const draggedIndex = game.categories.findIndex(cat => cat.id === draggedCategory);
    const targetIndex = game.categories.findIndex(cat => cat.id === targetCategoryId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newCategories = [...game.categories];
      const [draggedItem] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(targetIndex, 0, draggedItem);
      
      onUpdateGame(game.id, { categories: newCategories });
    }
    
    setDraggedCategory(null);
  };

  const handleUpdateGame = (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdateGame(game.id, gameData);
    setShowGameForm(false);
  };

  const toggleFavorite = () => {
    onUpdateGame(game.id, { isFavorite: !game.isFavorite });
  };

  // Calculate progress bar for categories with world record times
  const getProgressPercentage = (pbTime: string, wrTime: string): number => {
    if (!pbTime || !wrTime) return 0;
    
    // Simple time comparison - could be enhanced with proper time parsing
    const pbSeconds = parseTimeToSeconds(pbTime);
    const wrSeconds = parseTimeToSeconds(wrTime);
    
    if (pbSeconds <= wrSeconds) return 100;
    return Math.max(0, 100 - ((pbSeconds - wrSeconds) / wrSeconds) * 100);
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return 0;
  };

  const visibleTags = showAllTags ? game.tags : game.tags.slice(0, 2);
  const remainingTagsCount = game.tags.length - 2;

  return (
    <>
      <Card className="w-full mb-4 transition-all duration-200 hover:shadow-lg animate-fade-in">
        <CardHeader className="pb-3 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <img
                src={game.image || '/placeholder.svg'}
                alt={game.title}
                className="w-16 h-16 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-base md:text-lg break-words flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <span className="break-words">{game.title}</span>
                  {game.isFavorite && <Star size={16} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {visibleTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {!showAllTags && remainingTagsCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={() => setShowAllTags(true)}
                    >
                      (+{remainingTagsCount})
                    </Button>
                  )}
                  {showAllTags && game.tags.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={() => setShowAllTags(false)}
                    >
                      Show less
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end sm:justify-start space-x-1 flex-shrink-0 self-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="h-8 w-8 p-0"
              >
                <Star size={16} className={game.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
              </Button>
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
                onClick={() => setShowGameForm(true)}
                className="h-8 w-8 p-0"
              >
                <Edit size={16} />
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
          <CardContent className="pt-0 space-y-3 animate-accordion-down p-3 sm:p-6 sm:pt-0">
            {game.categories.map(category => (
              <div 
                key={category.id} 
                className={`p-3 border rounded-lg bg-muted/30 transition-all ${
                  draggedCategory === category.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                onDragOver={handleCategoryDragOver}
                onDrop={(e) => handleCategoryDrop(e, category.id)}
              >
                <div className="flex items-start sm:items-center justify-between mb-3 flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical size={12} className="text-muted-foreground cursor-grab" />
                    <h4 className="font-medium text-sm break-words">{category.name}</h4>
                    {category.isFavorite && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
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
                      onClick={() => handleDuplicateCategory(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy size={14} />
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                  <div>Placement: {category.placement}</div>
                  <div>PB: {category.pbTime}</div>
                  {category.placement > 1 && (
                    <>
                      <div>To Beat: {category.timeToBeat}</div>
                      <div>Difference: {category.timeDifference}</div>
                    </>
                  )}
                </div>

                {category.variables && (
                  <div className="mb-2">
                    <span className="text-xs font-medium">Variables: </span>
                    <span className="text-xs text-muted-foreground break-words">{category.variables}</span>
                  </div>
                )}

                {/* Progress bar for placement */}
                {category.placement > 1 && category.timeToBeat && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress to next place</span>
                      <span>{Math.round(getProgressPercentage(category.pbTime, category.timeToBeat))}%</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(category.pbTime, category.timeToBeat)} 
                      className="h-2"
                    />
                  </div>
                )}
                
                <div className="flex gap-1 flex-wrap">
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
                  {category.previousTimes && category.previousTimes.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Timer size={10} className="mr-1" />
                      {category.previousTimes.length} runs
                    </Badge>
                  )}
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

      {showGameForm && (
        <GameForm
          game={game}
          onSave={handleUpdateGame}
          onCancel={() => setShowGameForm(false)}
        />
      )}
    </>
  );
};
