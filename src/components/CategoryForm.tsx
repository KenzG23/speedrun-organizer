
import React, { useState, useEffect } from 'react';
import { Category } from '@/types/speedrun';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateTimeDifference, getNextPersonToBeat } from '@/utils/timeCalculations';
import { scheduleRunReminder } from '@/utils/notifications';

interface CategoryFormProps {
  category?: Category | null;
  onSave: (category: Omit<Category, 'id'> | Partial<Category>) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = ['Any%', '100%', 'Glitchless', 'Cheat%', 'Other'];

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    placement: 1,
    pbTime: '',
    sumOfBest: '',
    dateOfRun: '',
    nextPersonToBeat: '',
    timeToBeat: '',
    timeDifference: '',
    nextRunEligible: '',
    videoLink: '',
    notes: ''
  });

  const [customCategoryName, setCustomCategoryName] = useState('');

  useEffect(() => {
    if (category) {
      setFormData(category);
      if (!CATEGORY_OPTIONS.includes(category.name)) {
        setCustomCategoryName(category.name);
      }
    }
  }, [category]);

  useEffect(() => {
    // Auto-calculate next person to beat
    const nextPerson = getNextPersonToBeat(formData.placement);
    setFormData(prev => ({ ...prev, nextPersonToBeat: nextPerson }));
  }, [formData.placement]);

  useEffect(() => {
    // Auto-calculate time difference
    if (formData.pbTime && formData.timeToBeat) {
      const difference = calculateTimeDifference(formData.pbTime, formData.timeToBeat);
      setFormData(prev => ({ ...prev, timeDifference: difference }));
    }
  }, [formData.pbTime, formData.timeToBeat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      name: formData.name === 'Other' ? customCategoryName : formData.name
    };

    // Schedule notification if eligible date is set
    if (finalData.nextRunEligible) {
      await scheduleRunReminder(
        'Game', // You might want to pass game title as prop
        finalData.name,
        finalData.nextRunEligible
      );
    }

    onSave(finalData);
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categorySelect">Category</Label>
            <Select
              value={formData.name || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.name === 'Other' && (
              <Input
                placeholder="Enter custom category name"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div>
            <Label htmlFor="placement">Current Placement</Label>
            <Select
              value={formData.placement.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, placement: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pbTime">PB Time (mm:ss or hh:mm:ss)</Label>
            <Input
              id="pbTime"
              value={formData.pbTime}
              onChange={(e) => setFormData(prev => ({ ...prev, pbTime: e.target.value }))}
              placeholder="1:23:45"
              required
            />
          </div>

          <div>
            <Label htmlFor="timeToBeat">Time to Beat</Label>
            <Input
              id="timeToBeat"
              value={formData.timeToBeat}
              onChange={(e) => setFormData(prev => ({ ...prev, timeToBeat: e.target.value }))}
              placeholder="1:20:00"
              required
            />
          </div>

          <div>
            <Label>Next Person to Beat</Label>
            <Input value={formData.nextPersonToBeat} disabled className="bg-muted" />
          </div>

          <div>
            <Label>Time Difference</Label>
            <Input value={formData.timeDifference} disabled className="bg-muted" />
          </div>

          <div>
            <Label htmlFor="dateOfRun">Date of Run</Label>
            <Input
              id="dateOfRun"
              type="date"
              value={formData.dateOfRun}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfRun: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="nextRunEligible">Next Run Eligible</Label>
            <Input
              id="nextRunEligible"
              type="date"
              value={formData.nextRunEligible}
              onChange={(e) => setFormData(prev => ({ ...prev, nextRunEligible: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="sumOfBest">Sum of Best (optional)</Label>
            <Input
              id="sumOfBest"
              value={formData.sumOfBest}
              onChange={(e) => setFormData(prev => ({ ...prev, sumOfBest: e.target.value }))}
              placeholder="1:15:30"
            />
          </div>

          <div>
            <Label htmlFor="videoLink">Video Link (optional)</Label>
            <Input
              id="videoLink"
              type="url"
              value={formData.videoLink}
              onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this run..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
