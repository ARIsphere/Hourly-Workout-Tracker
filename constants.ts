
import type { Exercise } from './types';

export const WORKOUT_HOURS: number[] = Array.from({ length: 10 }, (_, i) => 10 + i); // 10 AM to 7 PM (19:00)

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'jumps',
    name: 'Jumps',
    goal: 10,
    hourlyLogs: {},
  },
  {
    id: 'squats',
    name: 'Squats',
    goal: 10,
    hourlyLogs: {},
  },
  {
    id: 'lift-weights',
    name: 'Lift Weights',
    goal: 10,
    hourlyLogs: {},
  },
  {
    id: 'pushups',
    name: 'Pushups',
    goal: 20,
    hourlyLogs: {},
  },
  {
    id: 'crunches',
    name: 'Crunches',
    goal: 20,
    hourlyLogs: {},
  },
];
