import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fitai_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data: object)  => api.post('/auth/signup', data),
  login:  (data: object)  => api.post('/auth/login',  data),
  me:     ()              => api.get('/auth/me'),
}

// ── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    ()           => api.get('/user/profile'),
  updateProfile: (data: object) => api.put('/user/profile', data),
  getStats:      ()           => api.get('/user/stats'),
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
}

// ── Meals ────────────────────────────────────────────────────────────────────
export const mealsAPI = {
  getDayPlan:   (params?: object)        => api.get('/meals/day-plan', { params }),
  search:       (params: object)         => api.get('/meals/search', { params }),
  getRecipe:    (id: number)             => api.get(`/meals/recipe/${id}`),
  logMeal:      (data: object)           => api.post('/meals/log', data),
  getLogs:      (limit?: number)         => api.get('/meals/logs', { params: { limit } }),
}

// ── Exercise ─────────────────────────────────────────────────────────────────
export const exerciseAPI = {
  getSuggestions:    (params?: object)      => api.get('/exercise/suggestions', { params }),
  getWeeklyPlan:     (params?: object)      => api.get('/exercise/weekly-plan', { params }),
  search:            (name: string)         => api.get('/exercise/search', { params: { name } }),
  getExerciseTypes:  ()                     => api.get('/exercise/types'),
  calculateBurn:     (data: object)         => api.post('/exercise/calculate-burn', data),
  recommendByBurn:   (data: object)         => api.post('/exercise/recommend-by-burn', data),
  estimateDuration:  (data: object)         => api.post('/exercise/estimate-duration', data),
  saveWorkout:       (data: object)         => api.post('/exercise/save', data),
  getSaved:          ()                     => api.get('/exercise/saved'),
  deleteSaved:       (id: string)           => api.delete(`/exercise/saved/${id}`),
  logExercise:       (data: object)         => api.post('/exercise/log', data),
  getExerciseLogs:   (days?: number)        => api.get('/exercise/logs', { params: { days } }),
  getWeeklyStats:    ()                     => api.get('/exercise/weekly-stats'),
}

// ── Logs ─────────────────────────────────────────────────────────────────────
export const logsAPI = {
  create: (data: object)      => api.post('/logs', data),
  getAll: (type?: string)     => api.get('/logs', { params: { type } }),
  delete: (id: string)        => api.delete(`/logs/${id}`),
}

export default api