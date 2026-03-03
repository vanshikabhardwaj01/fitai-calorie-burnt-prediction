import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { userAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { ChevronRight, ChevronLeft, User, Activity, Target, Utensils, Check } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Your Body',      icon: User,      desc: 'Basic measurements' },
  { id: 2, title: 'Activity',       icon: Activity,  desc: 'How active are you?' },
  { id: 3, title: 'Your Goal',      icon: Target,    desc: 'What are you aiming for?' },
  { id: 4, title: 'Diet Preferences',icon: Utensils, desc: 'Food preferences' },
]

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',        label: 'Sedentary',          desc: 'Little or no exercise' },
  { value: 'lightly_active',   label: 'Lightly Active',     desc: '1–3 days/week' },
  { value: 'moderately_active',label: 'Moderately Active',  desc: '3–5 days/week' },
  { value: 'very_active',      label: 'Very Active',        desc: '6–7 days/week' },
  { value: 'extra_active',     label: 'Extra Active',       desc: 'Athlete / physical job' },
]

const GOAL_OPTIONS = [
  { value: 'weight_loss',   label: '🔥 Lose Weight',    desc: '500 kcal daily deficit' },
  { value: 'muscle_gain',   label: '💪 Gain Muscle',    desc: 'Lean bulk, 300 kcal surplus' },
  { value: 'maintenance',   label: '⚖️ Maintain',       desc: 'Stay at current weight' },
  { value: 'extreme_loss',  label: '⚡ Aggressive Cut', desc: '750 kcal deficit' },
]

const DIET_OPTIONS = [
  { value: 'non_veg',      label: '🍗 Non-Veg',        desc: 'All foods' },
  { value: 'veg',          label: '🥦 Vegetarian',     desc: 'No meat/fish' },
  { value: 'vegan',        label: '🌱 Vegan',          desc: 'No animal products' },
  { value: 'keto',         label: '🥑 Keto',           desc: 'Low carb, high fat' },
]

const CUISINE_OPTIONS = ['Any', 'Indian', 'Italian', 'Mexican', 'Mediterranean', 'Asian', 'American', 'Thai']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    age: '', weight_kg: '', height_cm: '', gender: 'male',
    activity_level: 'moderately_active',
    goal: 'maintenance',
    diet_type: 'non_veg', cuisine_pref: 'Any',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleFinish() {
    setLoading(true)
    try {
      const payload = { ...form, age: +form.age, weight_kg: +form.weight_kg, height_cm: +form.height_cm }
      const res = await userAPI.updateProfile(payload)
      updateUser(res.data.user)
      toast.success('Profile set up! Welcome to FitAI 🎉')
      navigate('/dashboard')
    } catch {
      toast.error('Could not save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="orb w-80 h-80 bg-brand-500 top-0 right-0" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${step === s.id ? 'bg-brand-500 text-black' : step > s.id ? 'bg-brand-500/20 text-brand-400' : 'bg-white/[0.04] text-white/30'}`}>
                {step > s.id ? <Check size={12} /> : <s.icon size={12} />}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${step > s.id ? 'bg-brand-500/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8">

            <h2 className="text-2xl font-bold mb-1">{STEPS[step-1].title}</h2>
            <p className="text-white/40 text-sm mb-8">{STEPS[step-1].desc}</p>

            {/* Step 1: Body */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Age</label>
                    <input type="number" className="input-field" placeholder="25"
                      value={form.age} onChange={e => set('age', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-text">Gender</label>
                    <div className="flex gap-2">
                      {['male','female','other'].map(g => (
                        <button key={g} type="button"
                          onClick={() => set('gender', g)}
                          className={`flex-1 py-3 rounded-xl text-sm capitalize transition-all
                            ${form.gender === g ? 'bg-brand-500 text-black font-semibold' : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Weight (kg)</label>
                    <input type="number" className="input-field" placeholder="70"
                      value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-text">Height (cm)</label>
                    <input type="number" className="input-field" placeholder="170"
                      value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Activity */}
            {step === 2 && (
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('activity_level', opt.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left
                      ${form.activity_level === opt.value
                        ? 'border-brand-500/60 bg-brand-500/10 text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'}`}>
                    <div>
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                    </div>
                    {form.activity_level === opt.value && <Check size={16} className="text-brand-400" />}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('goal', opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all
                      ${form.goal === opt.value
                        ? 'border-brand-500/60 bg-brand-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                    <div className="text-sm font-semibold mb-1">{opt.label}</div>
                    <div className="text-xs text-white/40">{opt.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Diet */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text">Diet Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIET_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => set('diet_type', opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all
                          ${form.diet_type === opt.value
                            ? 'border-brand-500/60 bg-brand-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                        <div className="text-sm font-semibold">{opt.label}</div>
                        <div className="text-xs text-white/40">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-text">Cuisine Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map(c => (
                      <button key={c} type="button"
                        onClick={() => set('cuisine_pref', c)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all
                          ${form.cuisine_pref === c
                            ? 'bg-brand-500 text-black font-semibold'
                            : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep(s => s-1)} className="btn-ghost flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <div className="flex-1" />
              {step < 4 ? (
                <button onClick={() => setStep(s => s+1)} className="btn-primary flex items-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <><Check size={16} /> Finish Setup</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}