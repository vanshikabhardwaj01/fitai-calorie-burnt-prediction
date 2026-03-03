import { Settings, Key, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 page-enter max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings size={28} className="text-brand-400" />
          Settings
        </h1>
        <p className="text-white/40 text-sm mt-1">App configuration</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Key size={20} className="text-brand-400" />
          <h3 className="font-semibold text-lg">API Keys</h3>
        </div>

        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400/90 mb-2">
            <strong>Note:</strong> Configure API keys in backend .env file
          </p>
          <div className="space-y-1 text-xs text-white/60">
            <div>Spoonacular: 150 free calls/day</div>
            <div>API Ninjas: 10,000 free calls/month</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
            <div>
              <div className="font-medium text-sm">Spoonacular API</div>
              <div className="text-xs text-white/40">Meal recommendations</div>
            </div>
            <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs px-3 py-2 flex items-center gap-1">
              Get Key <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
            <div>
              <div className="font-medium text-sm">API Ninjas</div>
              <div className="text-xs text-white/40">Exercise database</div>
            </div>
            <a href="https://api-ninjas.com" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs px-3 py-2 flex items-center gap-1">
              Get Key <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Setup Guide</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-white/60">
          <li>Get API keys from links above</li>
          <li>Open backend .env file</li>
          <li>Add: SPOONACULAR_API_KEY=your_key</li>
          <li>Add: API_NINJAS_KEY=your_key</li>
          <li>Restart backend server</li>
        </ol>
      </div>
    </div>
  )
}