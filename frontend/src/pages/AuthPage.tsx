import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

interface AuthPageProps { mode: 'login' | 'signup' }

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate   = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading]   = useState(false)
  const [showPw,  setShowPw]    = useState(false)
  const [form, setForm] = useState({
    email: '', username: '', password: '', full_name: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await authAPI.login({ email: form.email, password: form.password })
        setAuth(res.data.user, res.data.access_token)
        toast.success(`Welcome back, ${res.data.user.full_name || res.data.user.username}!`)
        navigate('/dashboard')
      } else {
        const res = await authAPI.signup({
          email: form.email, username: form.username,
          password: form.password, full_name: form.full_name,
          // defaults — will be updated in onboarding
          age: 25, weight_kg: 70, height_cm: 170, gender: 'male',
        })
        setAuth(res.data.user, res.data.access_token)
        toast.success('Account created! Let\'s set up your profile.')
        navigate('/onboarding')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-96 h-96 bg-brand-500 top-[-100px] right-[-100px]" />
      <div className="orb w-64 h-64 bg-blue-500 bottom-[-50px] left-[-50px]" />

      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center neon-glow">
            <Zap size={18} className="text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">FitAI</span>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {mode === 'login'
              ? 'Sign in to your health dashboard'
              : 'Start your AI-powered fitness journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label-text">Full Name</label>
                  <input className="input-field" placeholder="Alex Johnson"
                    value={form.full_name} onChange={set('full_name')} />
                </div>
                <div>
                  <label className="label-text">Username</label>
                  <input className="input-field" placeholder="alexj"
                    value={form.username} onChange={set('username')} required />
                </div>
              </>
            )}

            <div>
              <label className="label-text">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password} onChange={set('password')} required
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={mode === 'login' ? '/signup' : '/login'}
              className="text-brand-400 hover:text-brand-300 font-medium">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}