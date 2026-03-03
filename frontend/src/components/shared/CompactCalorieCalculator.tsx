import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { exerciseAPI } from '../../api'
import { Flame, Calculator, Play } from 'lucide-react'

export default function CompactCalorieCalculator() {
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([])
  const [form, setForm] = useState({
    exercise: 'running_6mph',
    duration: 30,
    intensity: 'moderate' as 'light'|'moderate'|'vigorous'
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    exerciseAPI.getExerciseTypes().then(r => setExerciseTypes(r.data.exercise_types.slice(0, 20)))
  }, [])

  async function handleCalculate() {
    setLoading(true)
    try {
      const res = await exerciseAPI.calculateBurn({
        exercise_type: form.exercise,
        duration_minutes: form.duration,
        intensity: form.intensity,
      })
      setResult(res.data)
      toast.success('🔥 Calculated!')
    } catch {
      toast.error('Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLog() {
    if (!result) return
    try {
      await exerciseAPI.logExercise({
        exercise_type: form.exercise,
        exercise_name: result.exercise_type.replace(/_/g, ' '),
        duration_minutes: form.duration,
        calories_burned: result.calories_burned,
        intensity: form.intensity,
      })
      toast.success('💪 Logged!')
      setResult(null)
    } catch {
      toast.error('Failed to log')
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Calculator size={20} className="text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold">Quick Calorie Calculator</h3>
          <p className="text-xs text-white/40">Calculate calories burned instantly</p>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Exercise</label>
              <select 
                className="input-field text-sm py-2"
                value={form.exercise}
                onChange={e => setForm({...form, exercise: e.target.value})}>
                <option value="running_6mph">🏃 Running</option>
                <option value="cycling_moderate">🚴 Cycling</option>
                <option value="swimming_vigorous">🏊 Swimming</option>
                <option value="jump_rope">🪢 Jump Rope</option>
                <option value="weight_lifting_vigorous">🏋️ Weights</option>
                <option value="walking_4mph">🚶 Walking</option>
                <option value="hiit">⚡ HIIT</option>
                <option value="yoga_power">🧘 Yoga</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Minutes</label>
              <input 
                type="number"
                className="input-field text-sm py-2"
                value={form.duration}
                onChange={e => setForm({...form, duration: +e.target.value})}
                min="1" max="300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Intensity</label>
            <div className="flex gap-2">
              {(['light','moderate','vigorous'] as const).map(i => (
                <button key={i} onClick={() => setForm({...form, intensity: i})}
                  className={`flex-1 py-2 rounded-lg text-xs capitalize transition-all
                    ${form.intensity === i 
                      ? 'bg-orange-500/20 text-orange-400 font-semibold' 
                      : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleCalculate} disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Flame size={16} /> Calculate</>}
          </button>
        </div>
      ) : (
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}>
          <div className="text-center py-6 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={32} className="text-orange-400" />
              <div className="text-5xl font-bold font-mono text-orange-400">
                {Math.round(result.calories_burned)}
              </div>
            </div>
            <div className="text-white/40 text-sm">calories burned</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setResult(null)}
              className="flex-1 py-2.5 rounded-lg bg-white/[0.04] text-white/60 hover:bg-white/[0.08] text-sm font-medium">
              Again
            </button>
            <button onClick={handleLog}
              className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-black text-sm font-semibold flex items-center justify-center gap-1.5">
              <Play size={14} /> Log It
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}