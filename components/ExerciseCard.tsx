import React from 'react';
import type { Exercise } from '../types';
import { ExerciseTracker } from './HourTracker';

interface HourCardProps {
  hour: number;
  exercises: Exercise[];
  isCurrentHour: boolean;
  onSetReps: (exerciseId: string, hour: number, reps: number) => void;
  onSetToGoal: (exerciseId: string, hour: number) => void;
  onSetAllToGoal: (hour: number) => void;
}

const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12} ${period}`;
};

export const HourCard: React.FC<HourCardProps> = ({ hour, exercises, isCurrentHour, onSetReps, onSetToGoal, onSetAllToGoal }) => {
  const borderClass = isCurrentHour ? 'border-2 border-blue-500' : 'border border-slate-200 dark:border-slate-700';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 ${borderClass} transition-all`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg dark:text-white">Hour {formatHour(hour)}</h2>
        <button 
          onClick={() => onSetAllToGoal(hour)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 transition-colors"
        >
          Quick: Set All to Goal
        </button>
      </div>
      <div className="space-y-3">
        {exercises.map(exercise => (
          <ExerciseTracker
            key={exercise.id}
            exercise={exercise}
            hour={hour}
            reps={exercise.hourlyLogs[hour] || 0}
            onSetReps={(reps) => onSetReps(exercise.id, hour, reps)}
            onSetToGoal={() => onSetToGoal(exercise.id, hour)}
          />
        ))}
      </div>
    </div>
  );
};