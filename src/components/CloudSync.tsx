
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, Download, Upload, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  initializeGoogleDrive, 
  signInToGoogleDrive, 
  signOutFromGoogleDrive, 
  uploadToGoogleDrive,
  listGoogleDriveFiles,
  downloadFromGoogleDrive,
  isGoogleDriveConnected 
} from '@/utils/googleDrive';

interface CloudSyncProps {
  onExport: () => void;
  onImport: (data: any, mode: 'merge' | 'replace') => void;
}

export const CloudSync = ({ onExport, onImport }: CloudSyncProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [backupFiles, setBackupFiles] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected on component mount
    setIsConnected(isGoogleDriveConnected());
  }, []);

  const handleInitializeAndConnect = async () => {
    setInitializing(true);
    try {
      await initializeGoogleDrive();
      await signInToGoogleDrive();
      setIsConnected(true);
      setLastSync(new Date());
      
      // Load existing backup files
      const files = await listGoogleDriveFiles("name contains 'speedrun-backup'");
      setBackupFiles(files || []);
      
      toast({
        title: "Connected to Google Drive",
        description: "Successfully connected and authenticated with Google Drive.",
      });
    } catch (error) {
      console.error('Google Drive connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Drive. Please check your configuration and try again.",
        variant: "destructive"
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleDisconnect = () => {
    signOutFromGoogleDrive();
    setIsConnected(false);
    setBackupFiles([]);
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Google Drive.",
    });
  };

  const handleBackupToDrive = async () => {
    if (!isConnected) return;
    
    setSyncing(true);
    try {
      // Get current data for backup
      const data = {
        games: JSON.parse(localStorage.getItem('speedrun-games') || '[]'),
        settings: JSON.parse(localStorage.getItem('speedrun-settings') || '{}'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const fileName = `speedrun-backup-${new Date().toISOString().split('T')[0]}.json`;
      await uploadToGoogleDrive(data, fileName);
      
      // Refresh file list
      const files = await listGoogleDriveFiles("name contains 'speedrun-backup'");
      setBackupFiles(files || []);
      
      setLastSync(new Date());
      toast({
        title: "Backup Complete",
        description: "Your speedrun data has been successfully backed up to Google Drive.",
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to backup data to Google Drive. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRestoreFromDrive = async (fileId: string, fileName: string) => {
    try {
      const data = await downloadFromGoogleDrive(fileId);
      onImport(data, 'replace');
      toast({
        title: "Restore Complete",
        description: `Successfully restored data from ${fileName}`,
      });
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore data from Google Drive. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">☁️ Cloud Backup</h2>
      
      {/* Setup Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> To use Google Drive integration, you need to:
          <br />1. Create a project in Google Cloud Console
          <br />2. Enable the Google Drive API
          <br />3. Set up OAuth 2.0 credentials
          <br />4. Add your domain to authorized origins
          <br />5. Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY environment variables
        </AlertDescription>
      </Alert>
      
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud size={20} />
            Google Drive Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-yellow-500" />
              )}
              <span>{isConnected ? 'Connected to Google Drive' : 'Not connected'}</span>
            </div>
            {!isConnected ? (
              <Button 
                onClick={handleInitializeAndConnect}
                disabled={initializing}
              >
                {initializing ? 'Connecting...' : 'Connect Drive'}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>
          
          {lastSync && (
            <div className="text-sm text-muted-foreground">
              Last sync: {lastSync.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Sync Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sync Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-sync" className="flex flex-col gap-1">
                <span>Automatic Backup</span>
                <span className="text-sm text-muted-foreground">
                  Backup your data automatically when changes are made
                </span>
              </Label>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export Local File
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        onImport(data, 'merge');
                      } catch (error) {
                        toast({
                          title: "Import Failed",
                          description: "Invalid file format",
                          variant: "destructive"
                        });
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Import Local File
            </Button>
          </div>
          
          {isConnected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <Button
                onClick={handleBackupToDrive}
                disabled={syncing}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                {syncing ? 'Backing up...' : 'Backup to Drive'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Drive Files */}
      {isConnected && backupFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {backupFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Modified: {new Date(file.modifiedTime).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreFromDrive(file.id, file.name)}
                    className="flex items-center gap-2"
                  >
                    <Download size={14} />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
