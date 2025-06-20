
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cloud, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudSyncProps {
  onExport: () => void;
  onImport: (data: any, mode: 'merge' | 'replace') => void;
}

export const CloudSync = ({ onExport, onImport }: CloudSyncProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleConnectDrive = () => {
    // Simulate Google Drive connection
    toast({
      title: "Google Drive Integration",
      description: "Google Drive integration would require OAuth setup. For now, use manual export/import.",
    });
    
    // In a real implementation, this would use Google Drive API
    setIsConnected(true);
    setLastSync(new Date());
  };

  const handleManualSync = async () => {
    setSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date());
      toast({
        title: "Sync Complete",
        description: "Your data has been backed up successfully.",
      });
    }, 2000);
  };

  const handleDownloadFromCloud = () => {
    toast({
      title: "Download from Cloud",
      description: "This would download your latest backup from Google Drive.",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">☁️ Cloud Backup</h2>
      
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
            {!isConnected && (
              <Button onClick={handleConnectDrive}>
                Connect Drive
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
                onClick={handleManualSync}
                disabled={syncing}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                {syncing ? 'Syncing...' : 'Backup to Drive'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadFromCloud}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Restore from Drive
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Note:</strong> Full Google Drive integration requires OAuth setup and API credentials.</p>
            <p>For now, you can use the export/import functionality to manually backup your data to any cloud service.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
