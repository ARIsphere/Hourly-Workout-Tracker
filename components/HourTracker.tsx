import React from 'react';
import type { Exercise } from '../types';

interface ExerciseTrackerProps {
  exercise: Exercise;
  hour: number;
  reps: number;
  onSetReps: (reps: number) => void;
  onSetToGoal: () => void;
}

export const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ exercise, reps, onSetReps, onSetToGoal }) => {
  const isCompleted = reps >= exercise.goal;
  // Local state to manage the input's value as a string for stability.
  const [inputValue, setInputValue] = React.useState<string>(reps === 0 ? '' : String(reps));
  const isFocusedRef = React.useRef(false);

  // When the parent `reps` prop changes (e.g., from "Set all to goal"),
  // update our local `inputValue`, but only if the input isn't focused.
  // This prevents disrupting the user while they are typing.
  React.useEffect(() => {
    if (!isFocusedRef.current) {
      setInputValue(reps === 0 ? '' : String(reps));
    }
  }, [reps]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Update local state immediately for responsiveness.

    // Update parent state with a valid number.
    if (value.trim() === '') {
      onSetReps(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        onSetReps(numValue);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    // If the input was empty (representing 0), show '0' on focus for clarity.
    if (e.target.value === '') {
      setInputValue('0');
    }
    e.target.select(); // Select the text for easy replacement.
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    // When blurring, if the value is 0, revert to an empty string for the clean look.
    // Otherwise, ensure it reflects the last valid number.
    setInputValue(reps === 0 ? '' : String(reps));
  };

  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{exercise.name}</span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">Goal: {exercise.goal}</span>
      </div>
      <div className="flex items-center gap-1.5">
          <button onClick={() => onSetReps(reps - 5)} className="w-10 h-10 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">-5</button>
          <button onClick={() => onSetReps(reps - 1)} className="w-10 h-10 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">-1</button>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-10 text-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button onClick={() => onSetReps(reps + 1)} className="w-10 h-10 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">+1</button>
          <button onClick={() => onSetReps(reps + 5)} className="w-10 h-10 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">+5</button>
          <button onClick={onSetToGoal} className="px-4 h-10 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">Set Goal</button>
      </div>
    </div>
  );
};
