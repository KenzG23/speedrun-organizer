
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Upload } from 'lucide-react';
import { Game, AppSettings } from '@/types/speedrun';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { games: Game[]; settings?: AppSettings }, mode: 'merge' | 'replace') => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ games: Game[]; settings?: AppSettings } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setPreviewData(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.games || !Array.isArray(data.games)) {
        throw new Error('Invalid file format: Missing or invalid games array');
      }

      // Basic validation of game structure
      const requiredGameFields = ['id', 'title', 'section', 'categories'];
      const invalidGames = data.games.filter((game: any) => 
        !requiredGameFields.every(field => game.hasOwnProperty(field))
      );

      if (invalidGames.length > 0) {
        throw new Error(`Invalid game data structure found in ${invalidGames.length} games`);
      }

      setPreviewData({
        games: data.games,
        settings: data.settings
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    setIsLoading(true);
    try {
      onImport(previewData, importMode);
      onClose();
      resetState();
    } catch (err) {
      setError('Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setImportMode('merge');
    setError(null);
    setPreviewData(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload size={20} />
            Import Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select JSON File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewData && (
            <>
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="font-medium">Preview:</div>
                <div>Games: {previewData.games.length}</div>
                {previewData.settings && <div>Settings: Included</div>}
              </div>

              <div>
                <Label>Import Mode</Label>
                <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as 'merge' | 'replace')} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merge" id="merge" />
                    <Label htmlFor="merge" className="text-sm">Merge with existing data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace" className="text-sm">Replace all existing data</Label>
                  </div>
                </RadioGroup>
              </div>

              {importMode === 'replace' && (
                <div className="flex items-start gap-2 p-3 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Warning: This will permanently delete all your existing data.</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!previewData || isLoading}
          >
            {isLoading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
