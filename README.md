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
- **Dark/Light Theme**: Fully customizable UI theme with persistent storage

---

## 🚀 Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt password hashing
- **APIs**: 
  - Spoonacular API (meal recommendations)
  - API Ninjas (exercise database)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

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
```

Frontend will start at `http://localhost:5173`

---

## 🎮 Usage

### 1. Create Account
- Navigate to http://localhost:5173
- Click "Sign Up"
- Complete 4-step onboarding:
  - Step 1: Body measurements (age, weight, height, gender)
  - Step 2: Activity level
  - Step 3: Fitness goal (weight loss, muscle gain, maintenance)
  - Step 4: Diet preferences

### 2. Dashboard Overview
- View BMI status and health metrics
- See target calories and macro breakdown
- Quick access to calorie calculator
- Weekly progress summary

### 3. Calorie Burn Calculator
- Select exercise type (60+ options)
- Enter duration (1-300 minutes)
- Choose intensity (light, moderate, vigorous)
- Get instant calorie burn calculation
- Log exercise to database

### 4. Exercise Planner
- Select day of week
- Choose workout duration
- Set fitness goal
- Select difficulty level
- Generate personalized workout with 8 exercises
- Log individual exercises

### 5. Meal Planner
- View daily meal plan (breakfast, lunch, dinner, snacks)
- 3 options per meal type
- Filter by cuisine (Indian, Italian, Mediterranean, etc.)
- Filter by diet type (vegetarian, non-veg, vegan, keto)
- Log meals to track nutrition

### 6. Track Progress
- Weekly Progress: 7-day calorie burn analytics
- Saved Workouts: Your workout library
- Saved Meals: Meal history
- Activity Logs: Complete activity timeline

---

## 🧮 Calorie Calculation Formulas

### BMI (Body Mass Index)
```
BMI = weight_kg / (height_m²)
```

### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Formula
```
Men:   BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age + 5
Women: BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age - 161
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier

Activity Multipliers:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extra Active: 1.9
```

### Target Calories
```
Weight Loss: TDEE - 500 kcal
Muscle Gain: TDEE + 300 kcal
Maintenance: TDEE
```

### Calorie Burn (MET-based)
```
Calories per minute = (MET × weight_kg × 3.5) / 200
Total calories = Calories per minute × duration × intensity_multiplier

Intensity Multipliers:
- Light: 0.8
- Moderate: 1.0
- Vigorous: 1.2
```

---

## 📊 Features In Detail

### Calorie Burn Calculator (Main Feature)
- **60+ Exercise Types** organized by category:
  - Cardio: Running (5/6/8 mph), Cycling, Swimming, Jump Rope, HIIT
  - Strength: Weight Lifting, Push-ups, Pull-ups, Squats, Burpees
  - Sports: Basketball, Soccer, Tennis, Cricket, Badminton
  - Yoga/Dance: Power Yoga, Hatha Yoga, Zumba, Aerobics
  - Outdoor: Hiking, Rock Climbing, Kayaking
- **MET Values**: Scientifically accurate metabolic equivalents
- **Intensity Levels**: Adjustable workout intensity
- **Auto-logging**: One-click exercise logging
- **Real-time Calculation**: Instant calorie burn results

### Smart Meal Planning
- **Calorie Targeting**: Meals matched to your exact calorie needs
- **Meal Distribution**: 
  - Breakfast: 25% of daily calories
  - Lunch: 35% of daily calories
  - Dinner: 30% of daily calories
  - Snacks: 10% of daily calories
- **Nutrition Info**: Calories, protein, carbs, fat per meal
- **Fallback System**: Works offline with built-in meal database

### Exercise Recommendations
- **BMI-Aware**: Safe exercise suggestions based on your BMI
- **Goal-Based**: Different exercises for weight loss vs muscle gain
- **Difficulty Levels**: Beginner, Intermediate, Expert
- **Weekly Plans**: 7-day structured workout programs

### Progress Analytics
- **Weekly Burn Chart**: Visual 7-day calorie burn breakdown
- **Daily Breakdown**: Calories burned per day
- **Average Daily Burn**: Weekly average calculation
- **Most Active Day**: Identifies your peak performance day
- **Goal Progress**: Track progress towards weekly burn goals

---

## 🎨 Theme System

### Dark Mode (Default)
- Background: #080808
- Surface: #0f0f0f
- Text: White with opacity variants

### Light Mode
- Background: #ffffff
- Surface: #f8f9fa
- Text: Black with opacity variants
- Toggle in sidebar, persists in localStorage

---

## 🔐 Authentication & Security

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption
- **Protected Routes**: Frontend and backend route protection
- **Session Management**: 24-hour token expiry
- **CORS Configuration**: Secure cross-origin requests

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  full_name: String,
  age: Number,
  weight_kg: Number,
  height_cm: Number,
  gender: String,
  activity_level: String,
  goal: String,
  diet_type: String,
  bmi: Number,
  bmi_category: String,
  bmr: Number,
  tdee: Number,
  target_calories: Number,
  macros: Object,
  streak: Number,
  created_at: Date
}
```

### Exercise Logs Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  exercise_name: String,
  exercise_type: String,
  duration_minutes: Number,
  calories_burned: Number,
  intensity: String,
  date: Date
}
```

### Meal Logs Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  meal_name: String,
  meal_type: String,
  calories: Number,
  protein_g: Number,
  carbs_g: Number,
  fat_g: Number,
  date: Date
}
```

### Saved Workouts Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  goal: String,
  exercises: Array,
  duration_min: Number,
  created_at: Date
}
```

---

## 🐛 Known Issues & Limitations

### API Limitations
- **Spoonacular API**: 150 free requests/day (works with fallback data when exhausted)
- **API Ninjas**: 10,000 free requests/month (fallback database available)

### Current Bugs (Fixed in Latest Version)
- ✅ Exercise page KeyError - FIXED
- ✅ Settings page not rendering - FIXED
- ✅ Weekly progress blank screen - FIXED
- ✅ Light mode CSS issues - FIXED
- ✅ Profile name disappearing - FIXED

---

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variable: `VITE_API_URL=https://your-backend-url.com`
4. Deploy

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard overview

### Exercise
- `GET /api/exercise/types` - Get all exercise types
- `GET /api/exercise/suggestions` - Get exercise recommendations
- `POST /api/exercise/calculate-burn` - Calculate calories burned
- `POST /api/exercise/log` - Log exercise
- `GET /api/exercise/logs` - Get exercise logs
- `GET /api/exercise/weekly-stats` - Get weekly statistics
- `GET /api/exercise/saved` - Get saved workouts
- `POST /api/exercise/save` - Save workout
- `DELETE /api/exercise/saved/:id` - Delete saved workout

### Meals
- `GET /api/meals/day-plan` - Generate daily meal plan
- `POST /api/meals/log` - Log meal
- `GET /api/meals/logs` - Get meal logs

---

## 👨‍💻 Author

**Vanshika Bhardwaj**
- GitHub: [@vanshikabhardwaj01](https://github.com/vanshikabhardwaj01)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Spoonacular API for meal data
- API Ninjas for exercise database
- Tailwind CSS for styling framework
- Framer Motion for animations
- Recharts for data visualization

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using React, Flask, and MongoDB**
