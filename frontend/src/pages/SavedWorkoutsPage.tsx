import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exerciseAPI } from '../api'
import { Bookmark, Trash2, Dumbbell, Target } from 'lucide-react'

export default function SavedWorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [])

  async function loadWorkouts() {
    try {
      const res = await exerciseAPI.getSaved()
      setWorkouts(res.data.workouts || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await exerciseAPI.deleteSaved(id)
      setWorkouts(workouts.filter(w => w._id !== id))
      toast.success('✅ Workout deleted')
    } catch {
      toast.error('❌ Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 page-enter">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark size={28} className="text-purple-400" />
          Saved Workouts
        </h1>
        <p className="text-white/40 text-sm mt-1">Your workout library</p>
      </div>

      {workouts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bookmark size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No saved workouts</h3>
          <p className="text-sm text-white/40">Save workouts from the Exercise page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {workouts.map((workout, i) => (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 space-y-4">
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                      <Target size={12} />
                      <span className="capitalize">{workout.goal?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(workout._id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>

                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    {workout.exercises.slice(0, 3).map((ex: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Dumbbell size={14} className="text-brand-400" />
                        <span className="text-white/70">{ex.name}</span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-xs text-white/30 pl-5">
                        +{workout.exercises.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}