
import React, { useState, useEffect } from 'react';
import { Game, SectionType } from '@/types/speedrun';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Camera as CameraIcon, Star } from 'lucide-react';

interface GameFormProps {
  game?: Game;
  section?: SectionType;
  onSave: (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({ game, section, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [gameImage, setGameImage] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<SectionType>(section || 'ILs');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setGameImage(game.image || '');
      setSelectedSection(game.section);
      setTags(game.tags);
      setIsFavorite(game.isFavorite || false);
    }
  }, [game]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      
      if (image.dataUrl) {
        setGameImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      image: gameImage || undefined,
      section: selectedSection,
      categories: game?.categories || [],
      tags,
      isFavorite
    });
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : `Add New Game to ${section}`}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Game Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter game title"
              required
            />
          </div>

          {game && (
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={(value) => setSelectedSection(value as SectionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILs">Individual Levels</SelectItem>
                  <SelectItem value="Full Runs">Full Runs</SelectItem>
                  <SelectItem value="MultiRuns">Multi Runs</SelectItem>
                  <SelectItem value="Troll Runs">Troll Runs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Game Image</Label>
            <div className="flex items-center space-x-4">
              {gameImage ? (
                <img src={gameImage} alt="Preview" className="w-20 h-20 rounded object-cover" />
              ) : (
                <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                  <CameraIcon size={24} className="text-muted-foreground" />
                </div>
              )}
              <Button type="button" variant="outline" onClick={handleTakePhoto}>
                Select Image
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="favorite"
              checked={isFavorite}
              onCheckedChange={setIsFavorite}
            />
            <Label htmlFor="favorite" className="flex items-center gap-1">
              <Star size={14} />
              Mark as Favorite
            </Label>
          </div>

          <div>
            <Label htmlFor="newTag">Tags</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g., glitched)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X
                    size={12}
                    className="ml-1"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {game ? 'Update Game' : 'Add Game'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
