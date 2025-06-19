import React, { useState, useEffect } from 'react';
import { Category } from '@/types/speedrun';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateTimeDifference } from '@/utils/timeCalculations';

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions = ['Any%', '100%', 'Glitchless', 'Cheat%', 'Other'];
const placementOptions = Array.from({ length: 20 }, (_, i) => i + 1);

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
    notes: ''
  });

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
        notes: category.notes || ''
      });
    }
  }, [category]);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      timeDifference: calculateTimeDifference(prevData.pbTime, prevData.timeToBeat)
    }));
  }, [formData.pbTime, formData.timeToBeat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      notes: formData.notes
    });
  };

  return (
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
        <Label htmlFor="placement">Placement</Label>
        <Select value={String(formData.placement)} onValueChange={value => setFormData({ ...formData, placement: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue placeholder="Select placement" />
          </SelectTrigger>
          <SelectContent>
            {placementOptions.map(option => (
              <SelectItem key={option} value={String(option)}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="pbTime">Personal Best Time</Label>
        <Input
          id="pbTime"
          type="text"
          placeholder="00:00:00"
          value={formData.pbTime}
          onChange={e => setFormData({ ...formData, pbTime: e.target.value })}
          required
        />
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
      <div>
        <Label htmlFor="nextPersonToBeat">Next Person To Beat</Label>
        <Input
          id="nextPersonToBeat"
          type="text"
          value={formData.nextPersonToBeat}
          onChange={e => setFormData({ ...formData, nextPersonToBeat: e.target.value })}
          required
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
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
