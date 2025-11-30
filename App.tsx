import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_EXERCISES, WORKOUT_HOURS } from './constants';
import type { Exercise } from './types';
import { HourCard } from './components/ExerciseCard';
import { ManageExercisesModal } from './components/ManageExercisesModal';

const STORAGE_KEY = 'workout-tracker-data';
const STORAGE_DATE_KEY = 'workout-tracker-date';
const STORAGE_STREAK_KEY = 'workout-tracker-streak';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

interface StreakData {
  count: number;
  lastDate: string;
}

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());

  // Track the date associated with the currently loaded data
  const [trackedDate, setTrackedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Streak State
  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STREAK_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load streak data', e);
    }
    return { count: 0, lastDate: '' };
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedDate = localStorage.getItem(STORAGE_DATE_KEY);
      const today = getLocalDateString(new Date());

      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Basic validation
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          // If the saved data is from a previous day, reset the logs
          if (savedDate !== today) {
            console.log('New day detected on load. Resetting logs.');
            return parsed.map((ex: any) => ({
              ...ex,
              hourlyLogs: {} // Reset logs for the new day
            }));
          }
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
    return INITIAL_EXERCISES;
  });
  
  const currentHour = now.getHours();
  const currentHourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  // Check for day change while app is running (e.g., midnight crossing)
  useEffect(() => {
    const currentDayStr = getLocalDateString(now);
    if (currentDayStr !== trackedDate) {
      console.log('Midnight crossover detected. Resetting logs.');
      // Day changed! Reset logs
      setExercises(prev => prev.map(ex => ({ ...ex, hourlyLogs: {} })));
      setTrackedDate(currentDayStr);
    }
  }, [now, trackedDate]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_DATE_KEY, trackedDate);
  }, [exercises, trackedDate]);

  // Persist Streak
  useEffect(() => {
    localStorage.setItem(STORAGE_STREAK_KEY, JSON.stringify(streak));
  }, [streak]);
  
  useEffect(() => {
    // Scroll to current hour card on initial load and on hour change
    if (currentHour >= 10 && currentHour <= 19) {
        currentHourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentHour]);

  const handleSetReps = (exerciseId: string, hour: number, reps: number) => {
    const newReps = Math.max(0, reps); // Ensure reps are not negative
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            hourlyLogs: { ...ex.hourlyLogs, [hour]: newReps },
          };
        }
        return ex;
      })
    );
  };
  
  const handleSetToGoal = (exerciseId: string, hour: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      handleSetReps(exerciseId, hour, exercise.goal);
    }
  };

  const handleSetAllToGoalForHour = (hour: number) => {
    setExercises(prev =>
      prev.map(ex => ({
        ...ex,
        hourlyLogs: { ...ex.hourlyLogs, [hour]: ex.goal },
      }))
    );
  };

  // Exercise Management Handlers
  const handleAddExercise = (name: string, goal: number) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    setExercises(prev => [
      ...prev,
      {
        id,
        name,
        goal,
        hourlyLogs: {}
      }
    ]);
  };

  const handleDeleteExercise = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exercise? All data for it will be lost.')) {
      setExercises(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const handleUpdateGoal = (id: string, newGoal: number) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, goal: newGoal } : ex
    ));
  };

  const handleManualReset = () => {
    if (window.confirm('Are you sure you want to reset all progress for today? This cannot be undone.')) {
      setExercises(prev => prev.map(ex => ({ ...ex, hourlyLogs: {} })));
      setTrackedDate(getLocalDateString(new Date()));
      console.log('Manual reset triggered.');
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(exercises, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = getLocalDateString(now);
    link.download = `workout-data-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const date = getLocalDateString(now);
    
    // Header row
    const headers = ['date', 'hour', 'exercise_id', 'exercise_name', 'reps_done', 'hourly_goal'];
    let csvContent = headers.join(',') + '\n';

    // Data rows
    WORKOUT_HOURS.forEach(hour => {
      exercises.forEach(ex => {
        const reps = ex.hourlyLogs[hour] || 0;
        const row = [
          date,
          hour,
          ex.id,
          ex.name,
          reps,
          ex.goal
        ];
        csvContent += row.join(',') + '\n';
      });
    });

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-data-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { totalRepsToday, totalGoalToday, dailyCompletionPercentage } = useMemo(() => {
    let totalReps = 0;
    let totalGoal = 0;
    exercises.forEach(ex => {
      totalReps += (Object.values(ex.hourlyLogs) as number[]).reduce((sum, reps) => sum + reps, 0);
      totalGoal += ex.goal * WORKOUT_HOURS.length;
    });
    const percentage = totalGoal > 0 ? Math.min((totalReps / totalGoal) * 100, 100) : 0;
    return {
      totalRepsToday: totalReps,
      totalGoalToday: totalGoal,
      dailyCompletionPercentage: percentage,
    };
  }, [exercises]);
  
  // Streak Logic Effect
  useEffect(() => {
    const todayStr = getLocalDateString(now);
    const yesterdayStr = getYesterdayDateString(now);
    const isComplete = dailyCompletionPercentage >= 100;

    setStreak(prev => {
        // Case 1: User reached 100% today
        if (isComplete) {
            // If we haven't already credited today
            if (prev.lastDate !== todayStr) {
                // Check if user maintained the streak (completed yesterday)
                const isConsecutive = prev.lastDate === yesterdayStr;
                return {
                    count: isConsecutive ? prev.count + 1 : 1,
                    lastDate: todayStr
                };
            }
        } 
        // Case 2: User dropped below 100% today (and we had previously marked it done today)
        else if (!isComplete && prev.lastDate === todayStr) {
             // Revert logic: If we just incremented it, decrement it.
             // We don't perfectly know history, but we can infer:
             // If count is 1, they started today, so reset to 0.
             // If count > 1, they came from yesterday, so revert count and set date to yesterday.
             const newCount = Math.max(0, prev.count - 1);
             return {
                 count: newCount,
                 lastDate: newCount > 0 ? yesterdayStr : ''
             };
        }
        return prev;
    });
  }, [dailyCompletionPercentage, now]);

  const displayStreak = useMemo(() => {
      const todayStr = getLocalDateString(now);
      const yesterdayStr = getYesterdayDateString(now);
      // Streak is visible if last completion was today OR yesterday.
      // If it was 2 days ago, the streak is visually 0 (broken) until they complete today.
      if (streak.lastDate === todayStr || streak.lastDate === yesterdayStr) {
          return streak.count;
      }
      return 0;
  }, [streak, now]);

  const totalRepsByExercise = useMemo(() => {
    return exercises.map(ex => ({
        ...ex,
        totalReps: (Object.values(ex.hourlyLogs) as number[]).reduce((sum, reps) => sum + reps, 0)
    }));
  }, [exercises]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Hourly Workout Tracker (10am-7pm)
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                   <span>Today: {now.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                   <span className="hidden sm:inline">•</span>
                   <span>Time: {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsManageModalOpen(true)}
                className="self-start md:self-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Exercises
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-6">
                <button className="px-4 py-2 bg-slate-900 text-white rounded-md shadow-sm hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 transition-colors text-sm">Connect Google Drive</button>
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md shadow-sm hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80 transition-colors text-sm">Upload JSON to Drive</button>
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md shadow-sm hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80 transition-colors text-sm">Upload CSV to Drive</button>
                <button onClick={handleDownloadJSON} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">Download JSON</button>
                <button onClick={handleDownloadCSV} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">Download CSV</button>
                <button onClick={handleManualReset} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md shadow-sm hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40 transition-colors text-sm">Reset Daily Progress</button>
            </div>
          </header>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-1 text-sm text-slate-600 dark:text-slate-400">
                  <span>Daily Completion</span>
                  <div className="flex items-center gap-4">
                     {displayStreak > 0 && (
                         <span className="font-bold flex items-center gap-1 text-orange-500 animate-pulse">
                            {displayStreak} <span role="img" aria-label="fire">🔥</span> Streak
                         </span>
                     )}
                     <span className="font-semibold">{dailyCompletionPercentage.toFixed(0)}% (full-day total)</span>
                  </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${dailyCompletionPercentage}%` }}
                ></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                  {totalRepsByExercise.map(ex => (
                      <div key={ex.id} className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300">
                          {ex.name} <span className="font-semibold">{ex.totalReps}</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKOUT_HOURS.map(hour => (
              <div key={hour} ref={hour === currentHour ? currentHourRef : null}>
                <HourCard
                  hour={hour}
                  exercises={exercises}
                  isCurrentHour={hour === currentHour}
                  onSetReps={handleSetReps}
                  onSetToGoal={handleSetToGoal}
                  onSetAllToGoal={handleSetAllToGoalForHour}
                />
              </div>
            ))}
          </div>
      </main>

      <ManageExercisesModal 
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        exercises={exercises}
        onAddExercise={handleAddExercise}
        onDeleteExercise={handleDeleteExercise}
        onUpdateExerciseGoal={handleUpdateGoal}
      />
    </div>
  );
};

export default App;