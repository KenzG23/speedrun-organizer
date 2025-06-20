import React, { useState, useEffect } from 'react';
import { Category } from '@/types/speedrun';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Timer } from './Timer';
import { calculateTimeDifference } from '@/utils/timeCalculations';

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions = ['Any%', '100%', 'Glitchless', 'Cheat%', 'Other'];
const placementOptions = Array.from({ length: 150 }, (_, i) => i + 1);

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";  
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const getNextPersonToBeat = (placement: number): string => {
  if (placement <= 1) return "World Record";
  return `${placement - 1}${getOrdinalSuffix(placement - 1)} place`;
};

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onCancel
}) => {
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
    notes: '',
    variables: '',
    previousTimes: [] as string[],
    isFavorite: false
  });
  const [placementInput, setPlacementInput] = useState('1');
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        placement: category.placement,
        pbTime: category.pbTime,
        sumOfBest: category.sumOfBest || '',
        dateOfRun: category.dateOfRun,
        nextPersonToBeat: category.nextPersonToBeat,
        timeToBeat: category.timeToBeat,
        timeDifference: category.timeDifference,
        nextRunEligible: category.nextRunEligible || '',
        videoLink: category.videoLink || '',
        notes: category.notes || '',
        variables: category.variables || '',
        previousTimes: category.previousTimes || [],
        isFavorite: category.isFavorite || false
      });
    }
  }, [category]);

  useEffect(() => {
    // Auto-generate next person to beat based on placement
    const nextPerson = getNextPersonToBeat(formData.placement);
    setFormData(prevData => ({
      ...prevData,
      nextPersonToBeat: nextPerson
    }));
  }, [formData.placement]);

  useEffect(() => {
    if (formData.placement > 1) {
      setFormData(prevData => ({
        ...prevData,
        timeDifference: calculateTimeDifference(prevData.pbTime, prevData.timeToBeat)
      }));
    }
  }, [formData.pbTime, formData.timeToBeat, formData.placement]);

  const handlePlacementChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 150) {
      setPlacementInput(value);
      setFormData({ ...formData, placement: numValue });
    }
  };

  const handlePlacementInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlacementInput(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 150) {
      setFormData({ ...formData, placement: numValue });
    }
  };

  const handleTimerSave = (time: string) => {
    const currentPB = formData.pbTime;
    if (currentPB) {
      setFormData(prevData => ({
        ...prevData,
        previousTimes: [...prevData.previousTimes, currentPB],
        pbTime: time,
        dateOfRun: new Date().toISOString().split('T')[0]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        pbTime: time,
        dateOfRun: new Date().toISOString().split('T')[0]
      }));
    }
    setShowTimer(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      name: formData.name,
      placement: formData.placement,
      pbTime: formData.pbTime,
      sumOfBest: formData.sumOfBest,
      dateOfRun: formData.dateOfRun,
      nextPersonToBeat: formData.nextPersonToBeat,
      timeToBeat: formData.timeToBeat,
      timeDifference: formData.timeDifference,
      nextRunEligible: formData.nextRunEligible,
      videoLink: formData.videoLink,
      notes: formData.notes,
      variables: formData.variables,
      previousTimes: formData.previousTimes,
      isFavorite: formData.isFavorite
    });
  };

  const isFirstPlace = formData.placement === 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="placement">Placement (1-150)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="150"
                value={placementInput}
                onChange={handlePlacementInputChange}
                className="flex-1"
                placeholder="Type placement..."
              />
              <Select value={String(formData.placement)} onValueChange={handlePlacementChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {placementOptions.slice(0, 20).map(option => (
                    <SelectItem key={option} value={String(option)}>
                      {option}{getOrdinalSuffix(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="pbTime">Personal Best Time</Label>
            <div className="flex gap-2">
              <Input
                id="pbTime"
                type="text"
                placeholder="00:00:00"
                value={formData.pbTime}
                onChange={e => setFormData({ ...formData, pbTime: e.target.value })}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTimer(!showTimer)}
              >
                Timer
              </Button>
            </div>
          </div>
          
          {showTimer && (
            <Timer onSaveTime={handleTimerSave} />
          )}
          
          <div>
            <Label htmlFor="variables">Variables</Label>
            <Input
              id="variables"
              type="text"
              placeholder="e.g., Hard, NG+, PC, Glitched"
              value={formData.variables}
              onChange={e => setFormData({ ...formData, variables: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add any custom variables or modifiers for this run
            </p>
          </div>
          
          <div>
            <Label htmlFor="sumOfBest">Sum of Best</Label>
            <Input
              id="sumOfBest"
              type="text"
              placeholder="00:00:00"
              value={formData.sumOfBest}
              onChange={e => setFormData({ ...formData, sumOfBest: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="dateOfRun">Date of Run</Label>
            <Input
              id="dateOfRun"
              type="date"
              value={formData.dateOfRun}
              onChange={e => setFormData({ ...formData, dateOfRun: e.target.value })}
              required
            />
          </div>

          {!isFirstPlace && (
            <>
              <div>
                <Label htmlFor="nextPersonToBeat">Next Person To Beat</Label>
                <Input
                  id="nextPersonToBeat"
                  type="text"
                  value={formData.nextPersonToBeat}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="timeToBeat">Time To Beat</Label>
                <Input
                  id="timeToBeat"
                  type="text"
                  placeholder="00:00:00"
                  value={formData.timeToBeat}
                  onChange={e => setFormData({ ...formData, timeToBeat: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="nextRunEligible">Next Run Eligible</Label>
            <Input
              id="nextRunEligible"
              type="date"
              value={formData.nextRunEligible}
              onChange={e => setFormData({ ...formData, nextRunEligible: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="videoLink">Video Link</Label>
            <Input
              id="videoLink"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoLink}
              onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the run"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
