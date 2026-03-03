import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { mealsAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { Utensils, Clock, Zap, RefreshCw, Plus, ChevronDown } from 'lucide-react'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '⚡' }
const DIET_OPTIONS = [
  { value: 'non_veg', label: '🍗 All Foods' },
  { value: 'veg',     label: '🥦 Vegetarian' },
  { value: 'vegan',   label: '🌱 Vegan' },
  { value: 'keto',    label: '🥑 Keto' },
]
const CUISINES = ['Any','Indian','Italian','Mexican','Mediterranean','Asian','American','Thai']

interface Meal {
  id?: number; title: string; image?: string
  calories: number; protein: number; carbs: number; fat: number
  readyInMinutes?: number
}

function MealCard({ meal, onLog }: { meal: Meal; onLog: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover overflow-hidden">
      {meal.image && (
        <div className="h-36 overflow-hidden">
          <img src={meal.image} alt={meal.title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-sm mb-3 line-clamp-2 leading-snug">{meal.title}</h4>
        <div className="grid grid-cols-4 gap-1 mb-3">
          {[
            { label: 'kcal',    val: meal.calories },
            { label: 'protein', val: `${meal.protein}g` },
            { label: 'carbs',   val: `${meal.carbs}g` },
            { label: 'fat',     val: `${meal.fat}g` },
          ].map(s => (
            <div key={s.label} className="text-center p-1.5 bg-white/[0.03] rounded-lg">
              <div className="text-xs font-mono font-bold text-white/80">{s.val}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        {meal.readyInMinutes && (
          <div className="flex items-center gap-1 text-xs text-white/30 mb-3">
            <Clock size={11} /> {meal.readyInMinutes} min
          </div>
        )}
        <button onClick={onLog}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-medium transition-all">
          <Plus size={12} /> Log this meal
        </button>
      </div>
    </motion.div>
  )
}

export default function MealsPage() {
  const { user } = useAuthStore()
  const [plan, setPlan]         = useState<Record<string, Meal[]>>({})
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('breakfast')
  const [dietType, setDietType] = useState(user?.diet_type || 'non_veg')
  const [cuisine, setCuisine]   = useState(user?.cuisine_pref || 'Any')
  const [showFilters, setShowFilters] = useState(false)

  async function fetchPlan() {
    setLoading(true)
    try {
      const params: any = { diet_type: dietType }
      if (cuisine !== 'Any') params.cuisine = cuisine
      const res = await mealsAPI.getDayPlan(params)
      setPlan(res.data.plan)
    } catch {
      toast.error('Could not load meal plan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlan() }, [])

  async function handleLog(meal: Meal, mealType: string) {
    try {
      await mealsAPI.logMeal({
        meal_name: meal.title, meal_type: mealType,
        calories: meal.calories, protein: meal.protein,
        carbs: meal.carbs, fat: meal.fat, recipe_id: meal.id,
      })
      toast.success(`${meal.title} logged!`)
    } catch {
      toast.error('Could not log meal')
    }
  }

  const currentMeals = plan[activeTab] || []

  // Calorie split estimate
  const totalCalories = user?.target_calories || 2000
  const splits = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 }

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><Utensils size={22} className="text-brand-400" /> Meal Planner</h1>
          <p className="text-white/40 text-sm mt-0.5">
            AI-curated meals for your {totalCalories.toLocaleString()} kcal/day target
          </p>
        </div>
        <button onClick={() => setShowFilters(s => !s)}
          className="btn-ghost flex items-center gap-2 text-sm">
          Filters <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 space-y-3">
          <div>
            <label className="label-text">Diet Type</label>
            <div className="flex gap-2 flex-wrap">
              {DIET_OPTIONS.map(d => (
                <button key={d.value} onClick={() => setDietType(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all
                    ${dietType === d.value ? 'bg-brand-500 text-black font-semibold' : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">Cuisine</label>
            <div className="flex gap-2 flex-wrap">
              {CUISINES.map(c => (
                <button key={c} onClick={() => setCuisine(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all
                    ${cuisine === c ? 'bg-brand-500 text-black font-semibold' : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button onClick={fetchPlan} className="btn-primary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Apply & Refresh
          </button>
        </motion.div>
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-4 gap-3">
        {MEAL_TYPES.map(mt => {
          const mealCals = Math.round(totalCalories * (splits as any)[mt])
          return (
            <button key={mt} onClick={() => setActiveTab(mt)}
              className={`glass-card p-3 text-left transition-all
                ${activeTab === mt ? 'border-brand-500/40 bg-brand-500/5' : 'hover:border-white/10'}`}>
              <div className="text-xl mb-1">{MEAL_ICONS[mt]}</div>
              <div className="text-xs capitalize text-white/50">{mt}</div>
              <div className="text-sm font-mono font-bold mt-0.5 text-brand-400">{mealCals}</div>
              <div className="text-[10px] text-white/30">kcal</div>
            </button>
          )
        })}
      </div>

      {/* Meal Tab Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold capitalize flex items-center gap-2">
            {MEAL_ICONS[activeTab]} {activeTab} Options
            <span className="tag border-white/10 text-white/30 text-[10px]">{currentMeals.length} meals</span>
          </h2>
          <button onClick={fetchPlan}
            className={`btn-ghost text-xs flex items-center gap-1.5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="skeleton h-36" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentMeals.map((meal, i) => (
              <MealCard key={i} meal={meal} onLog={() => handleLog(meal, activeTab)} />
            ))}
          </div>
        )}
      </div>

      {/* Macro Progress */}
      {user?.macros && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap size={16} className="text-brand-400" /> Daily Macro Targets
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Protein', target: user.macros.protein_g, color: 'bg-blue-400', current: 89 },
              { label: 'Carbs',   target: user.macros.carbs_g,   color: 'bg-brand-400', current: 145 },
              { label: 'Fat',     target: user.macros.fat_g,     color: 'bg-orange-400', current: 52 },
            ].map(m => {
              const pct = Math.min((m.current / m.target) * 100, 100)
              return (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50">{m.label}</span>
                    <span className="font-mono">{m.current}g / {m.target}g</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}