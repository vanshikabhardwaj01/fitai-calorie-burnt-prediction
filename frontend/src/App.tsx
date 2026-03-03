import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import MealsPage from './pages/MealsPage'
import ProfilePage from './pages/ProfilePage'
import WeeklyProgressPage from './pages/WeeklyProgressPage'
import SettingsPage from './pages/SettingsPage'
import SavedWorkoutsPage from './pages/SavedWorkoutsPage'
import SavedMealsPage from './pages/SavedMealsPage'
import ExercisePageNew from './pages/ExercisePageNew'
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
        }}
      />
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"     element={<AuthPage mode="login" />} />
        <Route path="/signup"    element={<AuthPage mode="signup" />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="settings"   element={<SettingsPage />} />
        <Route path="progress" element={<WeeklyProgressPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index            element={<DashboardHome />} />
          <Route path="meals"     element={<MealsPage />} />
          <Route path="exercise"  element={<ExercisePageNew />} />
          <Route path="profile"   element={<ProfilePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="saved-meals" element={<SavedMealsPage />} />
         <Route path="workouts" element={<SavedWorkoutsPage />} />
  
</Route>
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}