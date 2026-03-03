import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { logsAPI, mealsAPI, exerciseAPI } from '../api'
import { ClipboardList, Utensils, Dumbbell, Trash2, Filter } from 'lucide-react'

type LogType = 'all' | 'meal' | 'exercise'

export default function LogsPage() {
  const [mealLogs,     setMealLogs]     = useState<any[]>([])
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([])
  const [filter,       setFilter]       = useState<LogType>('all')
  const [loading,      setLoading]      = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [mRes, eRes] = await Promise.all([
        mealsAPI.getLogs(30),
        exerciseAPI.getSuggestions(), // used as proxy for exercise logs
      ])
      setMealLogs(mRes.data.logs || [])
    } catch { toast.error('Could not load logs') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const allLogs = [
    ...mealLogs.map(l => ({ ...l, _type: 'meal' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filtered = filter === 'all' ? allLogs
    : allLogs.filter(l => l._type === filter)

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><ClipboardList size={22} className="text-brand-400" /> Activity Logs</h1>
          <p className="text-white/40 text-sm mt-0.5">Your complete health history</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'meal', 'exercise'] as LogType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === f ? 'bg-brand-500 text-black' : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardList size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/50">No logs yet</p>
          <p className="text-white/30 text-sm mt-1">Start logging meals and workouts to see your history here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-hover px-4 py-3 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                ${log._type === 'meal' ? 'bg-brand-500/10 text-brand-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {log._type === 'meal' ? <Utensils size={16} /> : <Dumbbell size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.meal_name || log.exercise_name || 'Activity'}</p>
                <p className="text-xs text-white/30 capitalize">{log.meal_type || log._type} · {new Date(log.date).toLocaleDateString()}</p>
              </div>
              {log.calories && (
                <div className="text-xs font-mono text-brand-400 flex-shrink-0">{log.calories} kcal</div>
              )}
              {log.calories_burned && (
                <div className="text-xs font-mono text-orange-400 flex-shrink-0">-{log.calories_burned} kcal</div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}