import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { mealsAPI } from '../api'
import { Utensils, Calendar, Flame } from 'lucide-react'

export default function SavedMealsPage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMeals() }, [])

  async function loadMeals() {
    try {
      const res = await mealsAPI.getLogs(30)
      setMeals(res.data.logs || [])  // FIXED: was res.data (missing .logs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 page-enter">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Utensils size={28} className="text-brand-400" /> Saved Meals
        </h1>
        <p className="text-white/40 text-sm mt-1">Your meal history</p>
      </div>

      {meals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Utensils size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No meals logged yet</h3>
          <p className="text-sm text-white/40">Start logging meals to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Utensils size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{meal.meal_name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span className="capitalize">{meal.meal_type}</span>
                      <span className="flex items-center gap-1">
                        <Flame size={12} />{meal.calories} kcal
                      </span>
                      {meal.protein > 0 && <span>P: {meal.protein}g</span>}
                      {meal.carbs > 0 && <span>C: {meal.carbs}g</span>}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white/30 flex items-center gap-1">
                  <Calendar size={12} />{new Date(meal.date).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}