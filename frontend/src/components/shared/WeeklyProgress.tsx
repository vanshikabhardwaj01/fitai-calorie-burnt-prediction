import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { exerciseAPI, mealsAPI } from '../../api'
import { TrendingUp, Flame, Target, Award, Calendar } from 'lucide-react'

export default function WeeklyProgress() {
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      exerciseAPI.getWeeklyStats(),
      exerciseAPI.getExerciseLogs(7),
    ])
      .then(([statsRes, logsRes]) => {
        setWeeklyStats({
          ...statsRes.data,
          totalWorkouts: logsRes.data.count,
          logs: logsRes.data.logs,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="glass-card p-6"><div className="skeleton h-48" /></div>
  }

  const totalBurned = weeklyStats?.total_burned || 0
  const avgDaily = weeklyStats?.average_daily || 0
  const mostActiveDay = weeklyStats?.most_active_day || 'N/A'
  const totalWorkouts = weeklyStats?.totalWorkouts || 0

  // Motivational messages based on progress
  const getMotivation = () => {
    if (totalBurned > 3000) return { emoji: '🔥', msg: 'You\'re on fire! Amazing week!', color: 'orange' }
    if (totalBurned > 2000) return { emoji: '💪', msg: 'Great progress! Keep it up!', color: 'brand' }
    if (totalBurned > 1000) return { emoji: '👍', msg: 'Good start! Let\'s aim higher!', color: 'blue' }
    return { emoji: '🎯', msg: 'Time to get moving! Start today!', color: 'purple' }
  }

  const motivation = getMotivation()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-${motivation.color}-500/10 flex items-center justify-center`}>
            <Calendar size={24} className={`text-${motivation.color}-400`} />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Progress</h3>
            <p className="text-xs text-white/40">Last 7 days summary</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30">Total Burned</div>
          <div className="text-2xl font-bold font-mono text-orange-400">{totalBurned.toLocaleString()}</div>
          <div className="text-xs text-white/40">kcal</div>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className={`p-4 rounded-xl bg-gradient-to-r from-${motivation.color}-500/10 to-transparent border border-${motivation.color}-500/20 mb-6`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{motivation.emoji}</div>
          <div>
            <div className={`text-sm font-semibold text-${motivation.color}-400`}>{motivation.msg}</div>
            <div className="text-xs text-white/40 mt-0.5">
              {totalWorkouts} workouts completed this week
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <Flame size={16} className="text-orange-400 mb-2" />
          <div className="text-xl font-bold font-mono">{avgDaily.toFixed(0)}</div>
          <div className="text-xs text-white/40">Avg Daily Burn</div>
        </div>
        
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <Target size={16} className="text-brand-400 mb-2" />
          <div className="text-xl font-bold font-mono">{totalWorkouts}</div>
          <div className="text-xs text-white/40">Workouts Done</div>
        </div>
        
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <Award size={16} className="text-purple-400 mb-2" />
          <div className="text-xl font-bold font-mono">{mostActiveDay}</div>
          <div className="text-xs text-white/40">Most Active</div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={14} />
            Daily Breakdown
          </h4>
        </div>
        <div className="space-y-2">
          {weeklyStats?.weekly_data?.map((day: any, i: number) => {
            const percentage = avgDaily > 0 ? (day.calories_burned / (avgDaily * 2)) * 100 : 0
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 text-xs text-white/40 font-mono">{day.day}</div>
                <div className="flex-1 h-8 bg-white/[0.04] rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`h-full rounded-lg ${
                      day.calories_burned > avgDaily 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                        : 'bg-gradient-to-r from-white/10 to-white/5'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-mono font-semibold">
                      {day.calories_burned > 0 ? `${day.calories_burned} kcal` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goal Progress */}
      <div className="mt-6 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Weekly Goal: 2500 kcal</span>
          <span className="text-xs font-mono text-brand-400">{((totalBurned / 2500) * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalBurned / 2500) * 100, 100)}%` }}
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}