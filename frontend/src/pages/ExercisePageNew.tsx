import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { exerciseAPI } from '../api'
import { Dumbbell, Play, Clock, Target, Calendar, Bookmark, Search } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DURATIONS = [15, 30, 45, 60, 90]
const GOALS = [
  { value: 'weight_loss', label: '🔥 Weight Loss', desc: 'Burn fat' },
  { value: 'muscle_gain', label: '💪 Muscle Gain', desc: 'Build strength' },
  { value: 'maintenance', label: '⚖️ Stay Fit', desc: 'Maintain' },
]

export default function ExercisePageNew() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    day: 'Monday',
    duration: 30,
    goal: 'weight_loss',
    difficulty: 'intermediate'
  })
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await exerciseAPI.getSuggestions({
        goal: form.goal,
        difficulty: form.difficulty,
        number: 8
      })
      setExercises(res.data.exercises || [])
      setStep(2)
      toast.success(`✨ Generated exercises for ${form.day}!`)
    } catch (err) {
      toast.error('Failed to generate exercises')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLog(exercise: any) {
    try {
      await exerciseAPI.logExercise({
        exercise_name: exercise.name,
        exercise_type: exercise.type || 'strength',
        duration_minutes: form.duration,
        sets_completed: 3,
        reps_completed: 12,
        calories_burned: Math.round(form.duration * 5), // Rough estimate
      })
      toast.success('💪 Exercise logged!')
    } catch {
      toast.error('Failed to log')
    }
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Dumbbell size={24} className="text-brand-400" />
          Exercise Planner
        </h1>
        <p className="text-white/40 text-sm mt-1">Personalized workout recommendations</p>
      </div>

      {step === 1 && (
        /* Step 1: User Input Form */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 max-w-2xl space-y-6">
          
          <h3 className="font-semibold text-lg">Tell us about your workout</h3>

          {/* Day Selection */}
          <div>
            <label className="label-text flex items-center gap-2 mb-3">
              <Calendar size={14} /> Which day?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map(day => (
                <button key={day} onClick={() => setForm({...form, day})}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all
                    ${form.day === day 
                      ? 'bg-brand-500 text-black' 
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="label-text flex items-center gap-2 mb-3">
              <Clock size={14} /> How long? (minutes)
            </label>
            <div className="flex gap-2">
              {DURATIONS.map(dur => (
                <button key={dur} onClick={() => setForm({...form, duration: dur})}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${form.duration === dur 
                      ? 'bg-brand-500 text-black' 
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'}`}>
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="label-text flex items-center gap-2 mb-3">
              <Target size={14} /> What's your goal?
            </label>
            <div className="space-y-2">
              {GOALS.map(goal => (
                <button key={goal.value} onClick={() => setForm({...form, goal: goal.value})}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                    ${form.goal === goal.value
                      ? 'border-brand-500/40 bg-brand-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                  <div>
                    <div className="font-medium text-sm">{goal.label}</div>
                    <div className="text-xs text-white/40">{goal.desc}</div>
                  </div>
                  {form.goal === goal.value && <Target size={14} className="text-brand-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="label-text mb-3">Difficulty Level</label>
            <div className="flex gap-2">
              {['beginner', 'intermediate', 'expert'].map(diff => (
                <button key={diff} onClick={() => setForm({...form, difficulty: diff})}
                  className={`flex-1 py-2.5 rounded-lg text-sm capitalize font-medium transition-all
                    ${form.difficulty === diff 
                      ? 'bg-brand-500 text-black' 
                      : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'}`}>
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Dumbbell size={20} />
                Generate My Workout
              </>
            )}
          </button>
        </motion.div>
      )}

      {step === 2 && exercises.length > 0 && (
        /* Step 2: Exercise Results */
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Your {form.day} Workout</h3>
              <p className="text-sm text-white/40">{form.duration} minutes · {form.difficulty} · {exercises.length} exercises</p>
            </div>
            <button onClick={() => setStep(1)} className="btn-ghost text-sm">
              Change Plan
            </button>
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{ex.name}</h4>
                    <p className="text-xs text-white/40 capitalize">{ex.muscle} · {ex.difficulty}</p>
                  </div>
                  <span className="tag border-brand-500/30 text-brand-400 bg-brand-500/10 text-xs">
                    {ex.type || 'strength'}
                  </span>
                </div>

                {ex.instructions && (
                  <p className="text-sm text-white/60 leading-relaxed">{ex.instructions}</p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleLog(ex)}
                    className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-black text-sm font-semibold flex items-center justify-center gap-1.5 transition-all">
                    <Play size={14} /> Log It
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <Bookmark size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}