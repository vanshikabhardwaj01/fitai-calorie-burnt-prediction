import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { exerciseAPI } from '../../api'
import { Flame, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-white/50">{label}</p>
        <p className="text-orange-400 font-mono font-bold flex items-center gap-1">
          <Flame size={12} /> {payload[0].value} kcal burned
        </p>
      </div>
    )
  }
  return null
}

export default function WeeklyBurnChart() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    exerciseAPI.getWeeklyStats()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="skeleton h-48" />
      </div>
    )
  }

  const chartData = data?.weekly_data || []
  const total = data?.total_burned || 0
  const avg = data?.average_daily || 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            Weekly Calorie Burn
          </h3>
          <p className="text-xs text-white/40 mt-0.5">Last 7 days</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30">Total Burned</div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-white/40">kcal</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={32}>
          <XAxis 
            dataKey="day" 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            width={40} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="calories_burned" radius={[6, 6, 0, 0]}>
            {chartData.map((entry: any, i: number) => (
              <Cell 
                key={i} 
                fill={entry.calories_burned > avg ? '#fb923c' : '#1a1a1a'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <TrendingUp size={12} />
          <span>Avg: <span className="font-mono text-white/60">{avg.toFixed(0)} kcal/day</span></span>
        </div>
        {data?.most_active_day && (
          <div className="text-xs">
            <span className="text-white/30">Most active: </span>
            <span className="text-orange-400 font-medium">{data.most_active_day}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}