
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, Save } from 'lucide-react';
import { TimerState } from '@/types/speedrun';

interface TimerProps {
  onSaveTime: (time: string) => void;
}

export const Timer = ({ onSaveTime }: TimerProps) => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: 0,
    elapsedTime: 0
  });

  const [displayTime, setDisplayTime] = useState('00:00:00');

  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = timer.elapsedTime + (currentTime - timer.startTime);
        setDisplayTime(formatTime(elapsed));
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.startTime, timer.elapsedTime, formatTime]);

  const handleStart = () => {
    setTimer({
      isRunning: true,
      startTime: Date.now(),
      elapsedTime: timer.elapsedTime
    });
  };

  const handlePause = () => {
    const currentTime = Date.now();
    setTimer({
      isRunning: false,
      startTime: 0,
      elapsedTime: timer.elapsedTime + (currentTime - timer.startTime)
    });
  };

  const handleReset = () => {
    setTimer({
      isRunning: false,
      startTime: 0,
      elapsedTime: 0
    });
    setDisplayTime('00:00:00');
  };

  const handleSave = () => {
    const finalTime = timer.isRunning 
      ? timer.elapsedTime + (Date.now() - timer.startTime)
      : timer.elapsedTime;
    
    const timeString = formatTime(finalTime);
    onSaveTime(timeString);
    handleReset();
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          <div className="text-2xl font-mono font-bold tracking-wider">
            {displayTime}
          </div>
          <div className="flex justify-center gap-2">
            {!timer.isRunning ? (
              <Button size="sm" onClick={handleStart}>
                <Play size={14} className="mr-1" />
                Start
              </Button>
            ) : (
              <Button size="sm" onClick={handlePause}>
                <Pause size={14} className="mr-1" />
                Pause
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleReset}>
              <Square size={14} className="mr-1" />
              Reset
            </Button>
            {(timer.elapsedTime > 0 || timer.isRunning) && (
              <Button size="sm" variant="secondary" onClick={handleSave}>
                <Save size={14} className="mr-1" />
                Save as PB
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
