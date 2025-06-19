import React, { useState } from 'react';
import { Game, SectionType } from '@/types/speedrun';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Camera as CameraIcon, Upload } from 'lucide-react';
import { CategoryForm } from './CategoryForm';

interface GameFormProps {
  section: SectionType;
  onSave: (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({ section, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [gameImage, setGameImage] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

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
      section,
      categories: [],
      tags
    });
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Game to {section}</DialogTitle>
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
            <Button type="submit" className="flex-1">Add Game</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
