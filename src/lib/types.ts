export const ACTIVITIES = ["Walk", "Nature", "Run", "Gardening", "Birdwatching"] as const;
export const DURATIONS = [15, 30, 60] as const;
export const DIFFICULTIES = ["Easy", "Curious", "Adventurous"] as const;
export const ENVIRONMENTS = ["City", "Park", "Trail", "Anywhere"] as const;

export type Activity = (typeof ACTIVITIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Environment = (typeof ENVIRONMENTS)[number];

export interface MissionPrefs {
  activity: Activity;
  duration: number;
  difficulty: Difficulty;
  environment: Environment;
  notes: string;
}

export type Source = "ai" | "demo";

export interface Mission {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  durationMin: number;
  exploration: string;
  phoneDown: string;
  safety: string;
  prefs: MissionPrefs;
  source: Source;
  model?: string | undefined;
}

export interface Session {
  mission: Mission;
  checked: boolean[];
  running: boolean;
  endAt: number | null; // when running
  remainingMs: number; // when paused
  startedAt: number;
  finished: boolean;
}

export interface JournalEntry {
  id: string;
  date: number;
  missionTitle: string;
  activity: Activity;
  durationMin: number;
  minutesSpent: number;
  tasks: { text: string; done: boolean }[];
  reflection: string;
  discoveryTitle: string;
  summary: string;
  photo?: string | undefined;
  source: Source;
  model?: string | undefined;
}
