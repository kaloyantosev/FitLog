'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Dumbbell, 
  Users, 
  Plus, 
  Settings, 
  Sparkles, 
  Edit3, 
  Check, 
  X, 
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { UserProfile, WorkoutTemplate, ExerciseItem } from '@/types';

export default function CoachPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Exercise Modal state
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    category: 'CHEST',
    equipment: 'BARBELL',
    instructions: '',
  });

  // Client Program Adjuster state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    targetWeight: 75.0,
    dailyCaloriesTarget: 2500,
    proteinTarget: 185,
    carbsTarget: 260,
    fatsTarget: 65,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, tRes, eRes] = await Promise.all([
        fetch('/api/user').then((r) => r.json()),
        fetch('/api/templates').then((r) => r.json()),
        fetch('/api/exercises').then((r) => r.json()),
      ]);

      if (uRes && !uRes.error) {
        setUser(uRes);
        setClientForm({
          name: uRes.name,
          targetWeight: uRes.targetWeight,
          dailyCaloriesTarget: uRes.dailyCaloriesTarget,
          proteinTarget: uRes.proteinTarget,
          carbsTarget: uRes.carbsTarget,
          fatsTarget: uRes.fatsTarget,
        });
      }

      if (Array.isArray(tRes)) setTemplates(tRes);
      if (Array.isArray(eRes)) setExercises(eRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseForm.name.trim()) return;

    try {
      await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseForm),
      });

      setExerciseForm({ name: '', category: 'CHEST', equipment: 'BARBELL', instructions: '' });
      setIsExerciseModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveClientSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        setUser(updated);
        setIsClientModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 uppercase tracking-wider font-mono">
              Coach Master Suite
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Coaching Management</h1>
          <p className="text-sm text-text-muted mt-1">
            Build and assign workout templates, manage exercise databases, and adjust client macro targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExerciseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Exercise
          </button>
        </div>
      </div>

      {/* Active Clients Roster */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Client Roster & Target Adjuster
          </h2>
          <span className="text-xs text-text-muted font-mono">1 Active Athlete</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center text-sm font-bold text-white font-mono">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-text-muted font-mono">{user?.email} • {user?.currentWeight}kg (Goal: {user?.targetWeight}kg)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-text-secondary">
              Target: <strong className="text-white">{user?.dailyCaloriesTarget} kcal</strong> ({user?.proteinTarget}g P)
            </div>

            <button
              onClick={() => setIsClientModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-all text-xs"
            >
              Adjust Plan
            </button>
          </div>
        </div>
      </div>

      {/* Templates Library in Coach Mode */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Master Workout Templates ({templates.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary font-mono">
                    {tmpl.category}
                  </span>
                  <span className="text-xs text-text-muted font-mono">{tmpl.exercises.length} movements</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{tmpl.title}</h4>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{tmpl.description || 'Custom template'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Assigned to Client</span>
                <span className="text-text-muted font-mono">Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Database Browser */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Exercise Database ({exercises.length})
          </h2>
          <button
            onClick={() => setIsExerciseModalOpen(true)}
            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
          >
            + Create New Exercise
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {exercises.map((ex) => (
            <div key={ex.id} className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white truncate max-w-[170px]">{ex.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-3 text-text-muted">{ex.category}</span>
              </div>
              <div className="text-[11px] text-text-muted capitalize">Equipment: {ex.equipment.toLowerCase()}</div>
              {ex.instructions && (
                <div className="text-[10px] text-text-hint mt-1.5 line-clamp-1 italic">{ex.instructions}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-1 border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Add Exercise to Library</h2>
                <p className="text-xs text-text-muted mt-0.5">Register new movement for workout builder.</p>
              </div>
              <button
                onClick={() => setIsExerciseModalOpen(false)}
                className="p-1 rounded-lg bg-surface-2 text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline DB Flyes"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Target Muscle
                  </label>
                  <select
                    value={exerciseForm.category}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-white"
                  >
                    <option value="CHEST">Chest</option>
                    <option value="BACK">Back</option>
                    <option value="LEGS">Legs</option>
                    <option value="SHOULDERS">Shoulders</option>
                    <option value="ARMS">Arms</option>
                    <option value="CORE">Core</option>
                    <option value="CARDIO">Cardio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Equipment
                  </label>
                  <select
                    value={exerciseForm.equipment}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-white"
                  >
                    <option value="BARBELL">Barbell</option>
                    <option value="DUMBBELL">Dumbbell</option>
                    <option value="CABLE">Cable</option>
                    <option value="MACHINE">Machine</option>
                    <option value="BODYWEIGHT">Bodyweight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Technique Instructions / Coaching Cues
                </label>
                <textarea
                  rows={2}
                  placeholder="Elbow tuck, scapular depression, tempo..."
                  value={exerciseForm.instructions}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsExerciseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-2 text-text-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Client Settings Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-1 border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Adjust Client Programming</h2>
                <p className="text-xs text-text-muted mt-0.5">Update targets for {user?.name}</p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg bg-surface-2 text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={clientForm.targetWeight}
                  onChange={(e) => setClientForm({ ...clientForm, targetWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={clientForm.dailyCaloriesTarget}
                  onChange={(e) => setClientForm({ ...clientForm, dailyCaloriesTarget: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={clientForm.proteinTarget}
                    onChange={(e) => setClientForm({ ...clientForm, proteinTarget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={clientForm.carbsTarget}
                    onChange={(e) => setClientForm({ ...clientForm, carbsTarget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    value={clientForm.fatsTarget}
                    onChange={(e) => setClientForm({ ...clientForm, fatsTarget: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-2 text-text-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 shadow-md"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
