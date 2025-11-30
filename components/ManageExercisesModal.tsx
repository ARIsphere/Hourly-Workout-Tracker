import React, { useState } from 'react';
import type { Exercise } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onAddExercise: (name: string, goal: number) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateExerciseGoal: (id: string, goal: number) => void;
}

export const ManageExercisesModal: React.FC<Props> = ({
  isOpen, onClose, exercises, onAddExercise, onDeleteExercise, onUpdateExerciseGoal
}) => {
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('10');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newName.trim()) {
      onAddExercise(newName.trim(), Math.max(1, parseInt(newGoal) || 10));
      setNewName('');
      setNewGoal('10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Exercises</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
           <div className="space-y-3">
             {exercises.length === 0 && (
               <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                 No exercises yet. Add one below!
               </div>
             )}
             {exercises.map(ex => (
               <div key={ex.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                 <div className="flex-1">
                   <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}</div>
                 </div>
                 <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hrly Goal:</label>
                    <input 
                      type="number" 
                      min="1"
                      value={ex.goal}
                      onChange={(e) => onUpdateExerciseGoal(ex.id, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                 </div>
                 <button 
                   onClick={() => onDeleteExercise(ex.id)}
                   className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                   title="Delete exercise"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
               </div>
             ))}
           </div>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Add New Exercise</h3>
             <div className="flex gap-3">
               <input 
                 type="text" 
                 placeholder="Name (e.g. Burpees)" 
                 value={newName}
                 onChange={(e) => setNewName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                 className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
               />
               <div className="w-24">
                  <input 
                    type="number" 
                    placeholder="Goal" 
                    min="1"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
               <button 
                 onClick={handleAdd}
                 disabled={!newName.trim()}
                 className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Add
               </button>
             </div>
        </div>
      </div>
    </div>
  );
};