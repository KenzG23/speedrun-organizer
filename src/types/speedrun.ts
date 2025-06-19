
export interface Game {
  id: string;
  title: string;
  image?: string;
  section: 'ILs' | 'Full Runs' | 'MultiRuns' | 'Troll Runs';
  categories: Category[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
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
}

export type SectionType = 'ILs' | 'Full Runs' | 'MultiRuns' | 'Troll Runs';

export interface AppSettings {
  darkMode: boolean;
  defaultGameImage: string;
}
