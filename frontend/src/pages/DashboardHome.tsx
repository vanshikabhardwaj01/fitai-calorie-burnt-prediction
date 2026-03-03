import CalorieBurnHero from '../components/shared/CalorieBurnHero'
import WeeklyProgress from '../components/shared/WeeklyProgress'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardAPI } from '../api'
import WeeklyBurnChart from '../components/shared/WeeklyBurnChart'
import { useAuthStore } from '../store/authStore'
import {
  Flame, Dumbbell, Utensils, TrendingUp, Target, Zap,
  ChevronRight, Award, Heart, Scale, Activity
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }: any) {
  const colorMap: Record<string, string> = {
    brand: 'text-brand-400 bg-brand-500/10',
    blue:  'text-blue-400 bg-blue-500/10',
    orange:'text-orange-400 bg-orange-500/10',
    purple:'text-purple-400 bg-purple-500/10',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold font-mono mt-1">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
      {sub && <div className="text-xs text-white/30">{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-white/50">{label}</p>
        <p className="text-brand-400 font-mono font-bold">{payload[0].value} kcal</p>
      </div>
    )
  }
  return null
}

export default function DashboardHome() {
  const { user } = useAuthStore()
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = data?.daily_calories
    ? Object.entries(data.daily_calories).map(([day, cal]) => ({ day, cal }))
    : [
        { day: 'Mon', cal: 1820 }, { day: 'Tue', cal: 2100 }, { day: 'Wed', cal: 1950 },
        { day: 'Thu', cal: 2300 }, { day: 'Fri', cal: 1750 }, { day: 'Sat', cal: 2050 }, { day: 'Sun', cal: 0 },
      ]

  const target = user?.target_calories || 2000
  const consumed = data?.stats?.total_calories_consumed || 0
  const burned   = data?.stats?.total_calories_burned   || 0
  const net = consumed - burned

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-brand-400">{user?.full_name?.split(' ')[0] || user?.username}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Here's your health overview for today</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass-card px-4 py-2">
          <Award size={16} className="text-brand-400" />
          <span className="text-sm font-mono text-brand-400">{user?.streak || 0} day streak</span>
        </div>
      </div>
      <CalorieBurnHero />
      
{/* 🔥 CALORIE BURN CALCULATOR - HERO SECTION 🔥 */}

      {/* BMI Hero Card */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-brand-400/70 uppercase tracking-widest font-mono mb-2">Your BMI</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-bold font-mono text-brand-400">{user?.bmi?.toFixed(1)}</span>
                <span className="text-lg text-white/50 mb-2">{user?.bmi_category}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30 mb-1">Daily Target</p>
              <p className="text-2xl font-bold font-mono">{target.toLocaleString()}</p>
              <p className="text-xs text-white/40">kcal/day</p>
            </div>
          </div>

          {/* Macro bar */}
          {user?.macros && (
            <div className="mt-5">
              <p className="text-xs text-white/40 mb-2 font-mono">Daily Macros</p>
              <div className="flex gap-2 text-xs">
                {[
                  { label: 'Protein', val: user.macros.protein_g, color: 'bg-blue-400', pct: user.macros.protein_pct },
                  { label: 'Carbs',   val: user.macros.carbs_g,   color: 'bg-brand-400', pct: user.macros.carbs_pct },
                  { label: 'Fat',     val: user.macros.fat_g,     color: 'bg-orange-400', pct: user.macros.fat_pct },
                ].map(m => (
                  <div key={m.label} className="flex-1 p-2 bg-white/[0.04] rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${m.color} mb-1`} />
                    <div className="font-bold font-mono">{m.val}g</div>
                    <div className="text-white/40">{m.label} {m.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Flame}    label="Calories Consumed" value={consumed.toLocaleString()} sub="This week" color="orange" />
        <StatCard icon={Zap}      label="Calories Burned"   value={burned.toLocaleString()}   sub="From exercise" color="brand" />
        <StatCard icon={Utensils} label="Meals Logged"      value={data?.stats?.meals_logged || 0}    sub="This week" color="blue" />
        <StatCard icon={Dumbbell} label="Workouts Done"     value={data?.stats?.exercises_logged || 0} sub="This week" color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/dashboard/meals',    icon: Utensils, label: 'Get Meal Plan',       color: 'from-brand-500/20 to-transparent' },
          { to: '/dashboard/exercise', icon: Dumbbell, label: 'Today\'s Workout',    color: 'from-blue-500/20 to-transparent' },
          { to: '/dashboard/workouts', icon: Target,   label: 'Saved Workouts',      color: 'from-purple-500/20 to-transparent' },
          { to: '/dashboard/logs',     icon: Activity, label: 'View Activity Logs',  color: 'from-orange-500/20 to-transparent' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className={`glass-card-hover p-4 bg-gradient-to-br ${item.color} flex items-center justify-between group`}>
            <div>
              <item.icon size={18} className="text-white/60 mb-2" />
              <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item.label}</p>
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}