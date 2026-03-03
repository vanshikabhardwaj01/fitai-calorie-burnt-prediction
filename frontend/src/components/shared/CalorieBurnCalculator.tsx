import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exerciseAPI } from '../../api'
import { Flame, Clock, Zap, Calculator, TrendingUp } from 'lucide-react'

interface CalorieBurnCalculatorProps {
  onLogExercise?: (data: any) => void
}

export default function CalorieBurnCalculator({ onLogExercise }: CalorieBurnCalculatorProps) {
  const [exerciseType, setExerciseType] = useState('running_5mph')
  const [duration, setDuration]         = useState(30)
  const [intensity, setIntensity]       = useState<'light'|'moderate'|'vigorous'>('moderate')
  const [result, setResult]             = useState<any>(null)
  const [loading, setLoading]           = useState(false)
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([])
  const [showTypes, setShowTypes]       = useState(false)

  useState(() => {
    exerciseAPI.getExerciseTypes().then(r => setExerciseTypes(r.data.exercise_types))
  })

  async function handleCalculate() {
    if (duration <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }
    setLoading(true)
    try {
      const res = await exerciseAPI.calculateBurn({
        exercise_type: exerciseType,
        duration_minutes: duration,
        intensity: intensity,
      })
      setResult(res.data)
      toast.success('Calories calculated! 🔥')
    } catch {
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLog() {
    if (!result) return
    try {
      await exerciseAPI.logExercise({
        exercise_type: exerciseType,
        exercise_name: exerciseType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        duration_minutes: duration,
        calories_burned: result.calories_burned,
        intensity: intensity,
      })
      toast.success('Exercise logged! 💪')
      if (onLogExercise) onLogExercise(result)
    } catch {
      toast.error('Could not log exercise')
    }
  }

  const intensityColors = {
    light:    'border-blue-500/40 text-blue-400 bg-blue-500/10',
    moderate: 'border-brand-500/40 text-brand-400 bg-brand-500/10',
    vigorous: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  }

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Calculator size={20} className="text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold">Calorie Burn Calculator</h3>
          <p className="text-xs text-white/40">Calculate calories burned during exercise</p>
        </div>
      </div>

      {/* Exercise Type Selector */}
      <div>
        <label className="label-text">Exercise Type</label>
        <div className="relative">
          <select 
            className="input-field"
            value={exerciseType}
            onChange={e => setExerciseType(e.target.value)}>
            <optgroup label="🏃 Cardio">
              <option value="running_8mph">Running (8 mph - Fast)</option>
              <option value="running_6mph">Running (6 mph - Moderate)</option>
              <option value="running_5mph">Jogging (5 mph)</option>
              <option value="walking_4mph">Brisk Walking (4 mph)</option>
              <option value="walking_3mph">Walking (3 mph)</option>
              <option value="cycling_fast">Cycling (Fast &gt;20 mph)</option>
              <option value="cycling_moderate">Cycling (Moderate 12-14 mph)</option>
              <option value="swimming_vigorous">Swimming (Vigorous)</option>
              <option value="jump_rope">Jump Rope</option>
              <option value="hiit">HIIT Training</option>
              <option value="stair_climbing">Stair Climbing</option>
            </optgroup>
            <optgroup label="💪 Strength">
              <option value="weight_lifting_vigorous">Weight Lifting (Vigorous)</option>
              <option value="weight_lifting_moderate">Weight Lifting (Moderate)</option>
              <option value="bodyweight_circuit">Bodyweight Circuit</option>
              <option value="push_ups">Push-ups</option>
              <option value="pull_ups">Pull-ups</option>
              <option value="squats">Squats</option>
              <option value="burpees">Burpees</option>
            </optgroup>
            <optgroup label="⚽ Sports">
              <option value="basketball_game">Basketball (Game)</option>
              <option value="soccer_game">Soccer</option>
              <option value="tennis_singles">Tennis (Singles)</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
            </optgroup>
            <optgroup label="🧘 Yoga & Dance">
              <option value="yoga_power">Power Yoga</option>
              <option value="yoga_hatha">Hatha Yoga</option>
              <option value="zumba">Zumba</option>
              <option value="dance_aerobic">Aerobic Dance</option>
            </optgroup>
          </select>
        </div>
        <button 
          onClick={() => setShowTypes(!showTypes)}
          className="text-xs text-brand-400 hover:text-brand-300 mt-1">
          {showTypes ? '− Hide' : '+ View'} all {exerciseTypes.length} exercise types
        </button>
      </div>

      {/* Duration & Intensity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Duration (minutes)</label>
          <input 
            type="number" 
            className="input-field"
            value={duration}
            onChange={e => setDuration(+e.target.value)}
            min="1"
            max="300"
          />
        </div>
        <div>
          <label className="label-text">Intensity</label>
          <div className="flex gap-1.5">
            {(['light', 'moderate', 'vigorous'] as const).map(i => (
              <button 
                key={i}
                onClick={() => setIntensity(i)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
                  ${intensity === i ? intensityColors[i] : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:bg-white/[0.08]'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button 
        onClick={handleCalculate}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <Flame size={16} /> Calculate Burn
          </>
        )}
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent">
            
            {/* Big Calories Display */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="flex items-end justify-center gap-2">
                  <Flame size={32} className="text-orange-400 mb-1" />
                  <span className="text-5xl font-bold font-mono text-orange-400">
                    {Math.round(result.calories_burned)}
                  </span>
                </div>
                <p className="text-white/40 text-sm mt-1">calories burned</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: Clock, label: 'Duration', value: `${duration} min` },
                { icon: Zap, label: 'Per Min', value: `${result.calories_per_minute}/min` },
                { icon: TrendingUp, label: 'MET', value: result.met_value.toFixed(1) },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 bg-white/[0.03] rounded-lg">
                  <stat.icon size={14} className="mx-auto text-white/30 mb-1" />
                  <div className="text-xs font-mono font-bold">{stat.value}</div>
                  <div className="text-[10px] text-white/30">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Log Button */}
            <button 
              onClick={handleLog}
              className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-black font-semibold text-sm transition-all active:scale-95">
              Log This Exercise
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Exercise Types Modal */}
      <AnimatePresence>
        {showTypes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="max-h-64 overflow-y-auto space-y-1 pt-2">
              {exerciseTypes.map(ex => (
                <button
                  key={ex.key}
                  onClick={() => {
                    setExerciseType(ex.key)
                    setShowTypes(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-white/[0.06] transition-all flex items-center justify-between
                    ${exerciseType === ex.key ? 'bg-brand-500/10 text-brand-400' : 'text-white/60'}`}>
                  <span>{ex.exercise_type}</span>
                  <span className={`tag text-[10px] ${
                    ex.intensity === 'High' ? 'border-orange-500/30 text-orange-400' :
                    ex.intensity === 'Moderate' ? 'border-brand-500/30 text-brand-400' :
                    'border-blue-500/30 text-blue-400'
                  }`}>
                    {ex.intensity}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}