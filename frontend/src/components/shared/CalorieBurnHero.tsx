import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exerciseAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Flame, Clock, Zap, TrendingUp, Activity, Calculator, ArrowRight } from 'lucide-react'

export default function CalorieBurnHero() {
  const { user } = useAuthStore()
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([])
  const [exerciseType, setExerciseType]   = useState('running_5mph')
  const [duration, setDuration]           = useState(30)
  const [intensity, setIntensity]         = useState<'light'|'moderate'|'vigorous'>('moderate')
  const [result, setResult]               = useState<any>(null)
  const [loading, setLoading]             = useState(false)
  const [showFullList, setShowFullList]   = useState(false)

  // Popular exercises for quick access
  const POPULAR_EXERCISES = [
    { key: 'running_6mph',     label: '🏃 Running',      met: 9.8 },
    { key: 'cycling_moderate', label: '🚴 Cycling',      met: 8.0 },
    { key: 'swimming_vigorous',label: '🏊 Swimming',     met: 10.0 },
    { key: 'jump_rope',        label: '🪢 Jump Rope',    met: 12.3 },
    { key: 'weight_lifting_vigorous', label: '🏋️ Weights', met: 6.0 },
    { key: 'yoga_power',       label: '🧘 Yoga',         met: 4.0 },
    { key: 'walking_4mph',     label: '🚶 Walking',      met: 5.0 },
    { key: 'hiit',             label: '⚡ HIIT',         met: 12.0 },
  ]

  useEffect(() => {
    exerciseAPI.getExerciseTypes()
      .then(r => setExerciseTypes(r.data.exercise_types))
      .catch(console.error)
  }, [])

  async function handleCalculate() {
    if (duration <= 0 || duration > 300) {
      toast.error('Duration must be between 1-300 minutes')
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
      toast.success('🔥 Calories calculated!')
    } catch (err) {
      toast.error('Calculation failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogExercise() {
    if (!result) return
    try {
      await exerciseAPI.logExercise({
        exercise_type: exerciseType,
        exercise_name: result.exercise_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        duration_minutes: duration,
        calories_burned: result.calories_burned,
        intensity: intensity,
      })
      toast.success('💪 Exercise logged successfully!')
      setResult(null)
      setDuration(30)
    } catch {
      toast.error('Failed to log exercise')
    }
  }

  const intensityConfig = {
    light:    { color: 'blue',   label: 'Light',    desc: 'Easy pace' },
    moderate: { color: 'brand',  label: 'Moderate', desc: 'Normal effort' },
    vigorous: { color: 'orange', label: 'Vigorous', desc: 'Hard effort' },
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent p-8">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame size={24} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Calorie Burn Calculator</h2>
                <p className="text-sm text-white/40">Calculate calories burned during any exercise</p>
              </div>
            </div>
          </div>
          {user && (
            <div className="text-right">
              <div className="text-xs text-white/30">Your Weight</div>
              <div className="text-xl font-bold font-mono text-orange-400">{user.weight_kg} kg</div>
            </div>
          )}
        </div>

        {!result ? (
          /* Input Form */
          <div className="space-y-6">
            {/* Popular Exercises - Quick Select */}
            <div>
              <label className="label-text mb-3">Quick Select Exercise</label>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR_EXERCISES.map(ex => (
                  <button
                    key={ex.key}
                    onClick={() => setExerciseType(ex.key)}
                    className={`p-3 rounded-xl text-left transition-all border
                      ${exerciseType === ex.key 
                        ? 'border-orange-500/40 bg-orange-500/10 text-white' 
                        : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.06]'}`}>
                    <div className="text-lg mb-1">{ex.label.split(' ')[0]}</div>
                    <div className="text-xs font-medium">{ex.label.split(' ')[1]}</div>
                    <div className="text-[10px] text-white/30 mt-1">MET {ex.met}</div>
                  </button>
                ))}
              </div>
              
              {/* Show all exercises toggle */}
              <button 
                onClick={() => setShowFullList(!showFullList)}
                className="text-xs text-orange-400 hover:text-orange-300 mt-2 flex items-center gap-1">
                {showFullList ? '− Hide' : '+ View'} all {exerciseTypes.length} exercises
              </button>

              {/* Full exercise list */}
              <AnimatePresence>
                {showFullList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <select 
                      className="input-field mt-3"
                      value={exerciseType}
                      onChange={e => setExerciseType(e.target.value)}>
                      {exerciseTypes.map(ex => (
                        <option key={ex.key} value={ex.key}>
                          {ex.exercise_type} (MET: {ex.met_value})
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duration & Intensity */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label className="label-text">Duration (minutes)</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="number"
                    className="input-field pl-10"
                    value={duration}
                    onChange={e => setDuration(Math.max(1, Math.min(300, +e.target.value)))}
                    min="1"
                    max="300"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[15, 30, 45, 60].map(min => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      className={`flex-1 py-1.5 rounded-lg text-xs transition-all
                        ${duration === min 
                          ? 'bg-orange-500/20 text-orange-400 font-semibold' 
                          : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'}`}>
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="label-text">Intensity Level</label>
                <div className="space-y-2">
                  {(['light', 'moderate', 'vigorous'] as const).map(i => {
                    const config = intensityConfig[i]
                    return (
                      <button
                        key={i}
                        onClick={() => setIntensity(i)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all border
                          ${intensity === i 
                            ? `border-${config.color}-500/40 bg-${config.color}-500/10` 
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]'}`}>
                        <div>
                          <div className={`text-sm font-medium ${intensity === i ? `text-${config.color}-400` : 'text-white/60'}`}>
                            {config.label}
                          </div>
                          <div className="text-xs text-white/30">{config.desc}</div>
                        </div>
                        {intensity === i && <Zap size={14} className={`text-${config.color}-400`} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Calculate Calories Burned
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Result Display */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6">
            
            {/* Big Result */}
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Flame size={48} className="text-orange-400 animate-pulse" />
                <div className="text-7xl font-bold font-mono text-orange-400">
                  {Math.round(result.calories_burned)}
                </div>
              </div>
              <div className="text-white/40 text-lg">calories burned</div>
              <div className="text-white/30 text-sm mt-2">
                {result.exercise_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} · {duration} minutes · {intensity}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Clock,        label: 'Duration',    value: `${duration} min`,              color: 'blue' },
                { icon: Zap,          label: 'Per Minute',  value: `${result.calories_per_minute}`,color: 'brand' },
                { icon: TrendingUp,   label: 'MET Value',   value: result.met_value.toFixed(1),    color: 'purple' },
                { icon: Activity,     label: 'Intensity',   value: result.intensity,               color: 'orange' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl bg-${stat.color}-500/5 border border-${stat.color}-500/20`}>
                  <stat.icon size={20} className={`text-${stat.color}-400 mb-2`} />
                  <div className="text-xl font-bold font-mono">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] font-medium transition-all">
                Calculate Again
              </button>
              <button
                onClick={handleLogExercise}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-black font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
                <Activity size={18} />
                Log This Exercise
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}