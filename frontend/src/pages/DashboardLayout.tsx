import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { TrendingUp } from 'lucide-react'
import { Heart } from 'lucide-react'
import {
  LayoutDashboard, Utensils, Dumbbell,
  ClipboardList, User, LogOut, Zap, Menu, X, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',             icon: LayoutDashboard, label: 'Overview',        end: true },
  { to: '/dashboard/meals',       icon: Utensils,        label: 'Meal Planner' },
  { to: '/dashboard/exercise',    icon: Dumbbell,        label: 'Exercise' },
  { to: '/dashboard/progress',    icon: TrendingUp,      label: 'Weekly Progress' },
  { to: '/dashboard/saved-meals', icon: Heart,           label: 'Saved Meals' },
  { to: '/dashboard/logs',        icon: ClipboardList,   label: 'Activity Logs' },
  { to: '/dashboard/profile',     icon: User,            label: 'Profile' },
  { to: '/dashboard/settings',    icon: Settings,        label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center neon-glow flex-shrink-0">
          <Zap size={15} className="text-black" />
        </div>
        <span className="font-bold text-lg tracking-tight">FitAI</span>
      </div>

      {/* User card */}
      <div className="mx-4 mt-4 p-3 glass-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
          {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user?.full_name || user?.username}</p>
          <p className="text-xs text-white/40 truncate">{user?.goal?.replace('_', ' ')}</p>
        </div>
        <div className="ml-auto bg-brand-500/20 text-brand-400 text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0">
          {user?.bmi?.toFixed(1)}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group
              ${isActive
                ? 'bg-brand-500/15 text-brand-400 font-medium'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'}`
            }>
            {({ isActive }) => (
              <>
                <item.icon size={17} className={isActive ? 'text-brand-400' : 'text-white/40 group-hover:text-white/60'} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* BMI badge */}
      {user?.bmi_category && (
        <div className="mx-4 mb-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
          <p className="text-xs text-white/30 mb-1">BMI Status</p>
          <p className="text-sm font-medium text-white/70">{user.bmi_category}</p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
              style={{ width: `${Math.min(((user.bmi - 10) / 35) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface-50 border-r border-white/[0.04] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#0e0e0e] border-r border-white/[0.06] z-50 flex flex-col lg:hidden">
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.06] text-white/50">
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/[0.06]">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-400" />
            <span className="font-bold">FitAI</span>
          </div>
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
