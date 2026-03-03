import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { exerciseAPI } from '../api'
import { Calendar, Flame, TrendingUp, Dumbbell } from 'lucide-react'

export default function WeeklyProgressPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    exerciseAPI.getWeeklyStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const totalBurned = stats?.total_burned || 0
  const avgDaily = stats?.average_daily || 0
  const weeklyData = stats?.weekly_data || []

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar size={28} className="text-brand-400" />
          Weekly Progress
        </h1>
        <p className="text-white/40 text-sm mt-1">Last 7 days summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6">
          <Flame size={24} className="text-orange-400 mb-3" />
          <div className="text-3xl font-bold font-mono text-orange-400">
            {totalBurned.toLocaleString()}
          </div>
          <div className="text-sm text-white/50 mt-1">Total Burned</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="glass-card p-6">
          <TrendingUp size={24} className="text-brand-400 mb-3" />
          <div className="text-3xl font-bold font-mono text-brand-400">
            {avgDaily.toFixed(0)}
          </div>
          <div className="text-sm text-white/50 mt-1">Avg Daily</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="glass-card p-6">
          <Dumbbell size={24} className="text-purple-400 mb-3" />
          <div className="text-3xl font-bold font-mono text-purple-400">
            {stats?.most_active_day || 'N/A'}
          </div>
          <div className="text-sm text-white/50 mt-1">Most Active</div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="glass-card p-6">
        <h3 className="font-semibold text-lg mb-6">Daily Breakdown</h3>
        <div className="space-y-3">
          {weeklyData.map((day: any, i: number) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-white/60">{day.day}</div>
              <div className="flex-1 h-12 bg-white/[0.04] rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((day.calories_burned / (avgDaily * 2)) * 100, 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`h-full rounded-lg ${
                    day.calories_burned > avgDaily
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : 'bg-gradient-to-r from-white/10 to-white/5'
                  }`}
                />
                <div className="absolute inset-0 flex items-center px-4">
                  <span className="text-sm font-mono font-semibold">
                    {day.calories_burned > 0 ? `${day.calories_burned} kcal` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}