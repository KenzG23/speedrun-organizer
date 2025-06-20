
export interface Game {
  id: string;
  title: string;
  image?: string;
  section: 'ILs' | 'Full Runs' | 'MultiRuns' | 'Troll Runs';
  categories: Category[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  name: string;
  placement: number;
  pbTime: string;
  sumOfBest?: string;
  dateOfRun: string;
  nextPersonToBeat: string;
  timeToBeat: string;
  timeDifference: string;
  nextRunEligible?: string;
  videoLink?: string;
  notes?: string;
  variables?: string;
  previousTimes?: string[];
  isFavorite?: boolean;
}

export type SectionType = 'ILs' | 'Full Runs' | 'MultiRuns' | 'Troll Runs';

export interface AppSettings {
  darkMode: boolean;
  defaultGameImage: string;
  tagPresets: string[];
  notificationsEnabled: boolean;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
}
