# FitAI 🏋️
AI-powered fitness & calorie tracking app

## Live Demo
- Frontend: https://fitai-calorie-burnt-prediction.vercel.app
- Backend: https://fitai-calorie-burnt-prediction.onrender.com

## Tech Stack
- React + TypeScript (Vercel)
- Flask + Python (Render)
- MongoDB Atlas
- Spoonacular API + API Ninjas
# FitAI - AI-Powered Health & Fitness Platform

A full-stack calorie burn prediction and fitness tracking application with personalized meal planning, exercise recommendations, and comprehensive health analytics.

## 🎯 Project Overview

FitAI is an intelligent health and fitness platform that uses AI-powered calculations to help users track calories, plan meals, and optimize workouts based on their individual body metrics and fitness goals.

### Core Features

- **Calorie Burn Prediction**: MET-based calculations for 60+ exercises with intensity multipliers
- **Smart Meal Planning**: AI-powered meal recommendations with precise calorie targeting
- **Exercise Generator**: Personalized workout plans based on BMI, goals, and fitness level
- **Weekly Progress Tracking**: Visual analytics for calorie burn and consumption


---


## 📁 Project Structure

```
fitai/
├── backend/
│   ├── app/
│   │   ├── __init__.py                    # Flask app factory
│   │   ├── config.py                      # Configuration
│   │   ├── database.py                    # MongoDB connection
│   │   ├── blueprints/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                    # Authentication routes
│   │   │   ├── user.py                    # User profile routes
│   │   │   ├── meals.py                   # Meal planning routes
│   │   │   ├── exercise.py                # Exercise routes
│   │   │   ├── dashboard.py               # Dashboard stats routes
│   │   │   └── logs.py                    # Activity logs routes
│   │   └── ml/
│   │       ├── __init__.py
│   │       ├── calorie_engine.py          # BMI/BMR/TDEE calculations
│   │       ├── meal_suggester.py          # Meal recommendations
│   │       ├── exercise_recommender.py    # Exercise suggestions
│   │       └── calorie_burn_calculator.py # MET-based burn calculations
│   ├── run.py                             # Application entry point
│   └── .env                               # Environment variables
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.ts                   # API client
    │   ├── components/
    │   │   └── shared/
    │   │       ├── CompactCalorieCalculator.tsx
    │   │       └── WeeklyProgress.tsx
    │   ├── pages/
    │   │   ├── AuthPage.tsx               # Login/Signup
    │   │   ├── OnboardingPage.tsx         # 4-step onboarding
    │   │   ├── DashboardLayout.tsx        # Main layout with sidebar
    │   │   ├── DashboardHome.tsx          # Dashboard overview
    │   │   ├── MealsPage.tsx              # Meal planner
    │   │   ├── ExercisePageNew.tsx        # Exercise generator
    │   │   ├── WeeklyProgressPage.tsx     # Weekly analytics
    │   │   ├── SavedWorkoutsPage.tsx      # Saved workout routines
    │   │   ├── SavedMealsPage.tsx         # Meal history
    │   │   ├── LogsPage.tsx               # Activity logs
    │   │   ├── ProfilePage.tsx            # User profile
    │   │   └── SettingsPage.tsx           # App settings
    │   ├── store/
    │   │   ├── authStore.ts               # Authentication state
    │   │   └── themeStore.ts              # Theme state
    │   ├── App.tsx                        # Main app component
    │   ├── main.tsx                       # React entry point
    │   └── index.css                      # Global styles
    ├── tailwind.config.js                 # Tailwind configuration
    ├── vite.config.ts                     # Vite configuration
    └── package.json                       # Dependencies
```

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/vanshikabhardwaj01/demo.git
cd demo/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install flask flask-cors flask-jwt-extended pymongo bcrypt requests python-dotenv --break-system-packages
```

4. **Configure environment variables**

Create `.env` file in `backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017/fitai_db
JWT_SECRET_KEY=your-secret-key-change-in-production
SPOONACULAR_API_KEY=your_spoonacular_key  # Optional
API_NINJAS_KEY=your_api_ninjas_key        # Optional
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

**Getting API Keys (Optional - app works with fallback data):**
- Spoonacular: https://spoonacular.com/food-api (150 free calls/day)
- API Ninjas: https://api-ninjas.com (10,000 free calls/month)

5. **Run the backend**
```bash
python run.py
```

Backend will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev


 Deployment

 Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variable: `VITE_API_URL=https://your-backend-url.com`
4. Deploy

---


👨‍💻 Author

**Vanshika Bhardwaj**
- GitHub: [@vanshikabhardwaj01](https://github.com/vanshikabhardwaj01)

