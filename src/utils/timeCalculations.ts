
export function timeStringToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts.map(Number);
    return minutes * 60 + seconds;
  }
  return 0;
}

export function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateTimeDifference(pbTime: string, timeToBeat: string): string {
  const pbSeconds = timeStringToSeconds(pbTime);
  const targetSeconds = timeStringToSeconds(timeToBeat);
  const difference = targetSeconds - pbSeconds;
  
  if (difference <= 0) return "Already ahead!";
  return secondsToTimeString(difference);
}

export function getNextPersonToBeat(placement: number): string {
  if (placement <= 1) return "World Record";
  return `${placement - 1}${getOrdinalSuffix(placement - 1)} place`;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
