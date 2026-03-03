import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { userAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { User, Scale, Activity, Target, Save, RefreshCw, Heart, TrendingUp, Flame } from 'lucide-react'

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',         label: 'Sedentary',          desc: 'Little or no exercise' },
  { value: 'lightly_active',    label: 'Lightly Active',     desc: '1–3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active',  desc: '3–5 days/week' },
  { value: 'very_active',       label: 'Very Active',        desc: '6–7 days/week' },
  { value: 'extra_active',      label: 'Extra Active',       desc: 'Athlete / physical job' },
]

const GOAL_OPTIONS = [
  { value: 'weight_loss',  label: '🔥 Lose Weight',    desc: '500 kcal daily deficit' },
  { value: 'muscle_gain',  label: '💪 Gain Muscle',    desc: 'Lean bulk, 300 kcal surplus' },
  { value: 'maintenance',  label: '⚖️ Maintain',       desc: 'Stay at current weight' },
  { value: 'extreme_loss', label: '⚡ Aggressive Cut', desc: '750 kcal deficit' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [loading,   setLoading]   = useState(false)
  const [statsLoad, setStatsLoad] = useState(false)
  const [stats,     setStats]     = useState<any>(null)
  const [form, setForm] = useState({
    full_name:      user?.full_name      || '',
    age:            user?.age            || 25,
    weight_kg:      user?.weight_kg      || 70,
    height_cm:      user?.height_cm      || 170,
    gender:         user?.gender         || 'male',
    activity_level: user?.activity_level || 'moderately_active',
    goal:           user?.goal           || 'maintenance',
    diet_type:      user?.diet_type      || 'non_veg',
  })

  useEffect(() => {
    loadStats()
  }, [])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    setLoading(true)
    try {
      const res = await userAPI.updateProfile(form)
      updateUser(res.data.user)
      toast.success('✅ Profile updated!')
      await loadStats() // Refresh stats
    } catch {
      toast.error('❌ Update failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    setStatsLoad(true)
    try {
      const res = await userAPI.getStats()
      setStats(res.data)
    } catch {
      toast.error('Could not load stats')
    } finally {
      setStatsLoad(false)
    }
  }

  const bmiColor = user?.bmi
    ? user.bmi < 18.5 ? 'text-blue-400'
    : user.bmi < 25   ? 'text-brand-400'
    : user.bmi < 30   ? 'text-yellow-400'
    : 'text-red-400'
    : 'text-white'

  return (
    <div className="space-y-5 page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <User size={22} className="text-brand-400" /> Your Profile
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Manage your health information</p>
        </div>
        <button onClick={loadStats} disabled={statsLoad}
          className="btn-ghost flex items-center gap-2 text-sm">
          {statsLoad ? <RefreshCw size={14} className="animate-spin" /> : <Heart size={14} />}
          Refresh Stats
        </button>
      </div>

      {/* BMI Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* BMI Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold font-mono ${bmiColor}`}>
                {user?.bmi?.toFixed(1)}
              </div>
              <div className="text-xs text-white/40 mt-1">BMI</div>
            </div>

            {/* Category & Range */}
            <div className="flex-1">
              <p className="font-semibold text-lg">{user?.bmi_category}</p>
              <p className="text-sm text-white/40 mt-1">
                Ideal weight: {user ? `${(user as any).ideal_weight_min?.toFixed(1)}–${(user as any).ideal_weight_max?.toFixed(1)} kg` : '—'}
              </p>
              
              {/* BMI Bar */}
              <div className="mt-3 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  user?.bmi && user.bmi < 18.5 ? 'bg-blue-400 w-1/5'
                  : user?.bmi && user.bmi < 25  ? 'bg-brand-400 w-2/5'
                  : user?.bmi && user.bmi < 30  ? 'bg-yellow-400 w-3/5'
                  : 'bg-red-400 w-4/5'}`} />
              </div>
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
              </div>
            </div>
          </div>

          {/* Target Calories */}
          <div className="text-right">
            <div className="text-xs text-white/30 mb-1">Target Calories</div>
            <div className="text-3xl font-bold font-mono text-brand-400">
              {user?.target_calories?.toLocaleString()}
            </div>
            <div className="text-xs text-white/30">kcal/day</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Flame,        label: 'BMR',          val: `${stats.bmr} kcal`, desc: 'Base metabolic rate', color: 'orange' },
            { icon: TrendingUp,   label: 'TDEE',         val: `${stats.tdee} kcal`, desc: 'Total daily energy', color: 'brand' },
            { icon: Scale,        label: 'Body Fat',     val: `${stats.body_fat_est}%`, desc: 'Estimated', color: 'blue' },
            { icon: Activity,     label: 'Total Logs',   val: stats.total_logs, desc: 'All time', color: 'purple' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 border-${s.color}-500/10`}>
              <s.icon size={18} className={`text-${s.color}-400 mb-2`} />
              <div className="text-xl font-bold font-mono">{s.val}</div>
              <div className="text-xs text-white/40">{s.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Edit Form */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="font-semibold flex items-center gap-2">
          <User size={18} />
          Edit Your Information
        </h3>

        {/* Name */}
    {/* Name Input - FIXED VERSION */}
 <input 
  className="input-field" 
  value={form.full_name || ''} 
  onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
  placeholder="Enter your full name"
/>

        {/* Body Measurements */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-text">Age</label>
            <input type="number" className="input-field" placeholder="25"
              value={form.age} onChange={e => set('age', +e.target.value)} />
          </div>
          <div>
            <label className="label-text">Weight (kg)</label>
            <input type="number" className="input-field" placeholder="70"
              value={form.weight_kg} onChange={e => set('weight_kg', +e.target.value)} />
          </div>
          <div>
            <label className="label-text">Height (cm)</label>
            <input type="number" className="input-field" placeholder="170"
              value={form.height_cm} onChange={e => set('height_cm', +e.target.value)} />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="label-text">Gender</label>
          <div className="flex gap-2">
            {['male', 'female', 'other'].map(g => (
              <button key={g} type="button" onClick={() => set('gender', g)}
                className={`flex-1 py-2.5 rounded-xl text-sm capitalize transition-all
                  ${form.gender === g ? 'bg-brand-500 text-black font-semibold' : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="label-text">Activity Level</label>
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set('activity_level', opt.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                  ${form.activity_level === opt.value
                    ? 'border-brand-500/40 bg-brand-500/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'}`}>
                <div>
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-white/40">{opt.desc}</div>
                </div>
                {form.activity_level === opt.value && <Activity size={14} className="text-brand-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="label-text">Fitness Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set('goal', opt.value)}
                className={`p-3 rounded-xl border text-left transition-all
                  ${form.goal === opt.value
                    ? 'border-brand-500/40 bg-brand-500/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                <div className="text-sm font-semibold mb-1">{opt.label}</div>
                <div className="text-xs text-white/40">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={loading}
          className="btn-primary flex items-center gap-2 w-full md:w-auto">
          {loading ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )
}