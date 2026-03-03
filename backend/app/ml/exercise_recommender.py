"""
Exercise Recommender
Recommends exercises based on user BMI, goal, and fitness level.
Falls back to built-in data if API unavailable.
"""

import os
import requests

# Built-in fallback exercise database
FALLBACK_EXERCISES = [
    # Cardio
    {"name": "Running", "type": "cardio", "muscle": "cardio", "difficulty": "intermediate", "instructions": "Run at steady pace"},
    {"name": "Jump Rope", "type": "cardio", "muscle": "cardio", "difficulty": "beginner", "instructions": "Jump rope for cardio"},
    {"name": "Cycling", "type": "cardio", "muscle": "legs", "difficulty": "beginner", "instructions": "Cycle at moderate pace"},
    {"name": "Swimming", "type": "cardio", "muscle": "cardio", "difficulty": "intermediate", "instructions": "Swim laps"},
    
    # Strength
    {"name": "Push-ups", "type": "strength", "muscle": "chest", "difficulty": "beginner", "instructions": "Standard push-ups"},
    {"name": "Pull-ups", "type": "strength", "muscle": "back", "difficulty": "expert", "instructions": "Pull-ups on bar"},
    {"name": "Squats", "type": "strength", "muscle": "quadriceps", "difficulty": "beginner", "instructions": "Bodyweight squats"},
    {"name": "Lunges", "type": "strength", "muscle": "quadriceps", "difficulty": "beginner", "instructions": "Forward lunges"},
    {"name": "Plank", "type": "strength", "muscle": "abdominals", "difficulty": "beginner", "instructions": "Hold plank position"},
    {"name": "Deadlift", "type": "strength", "muscle": "lower_back", "difficulty": "intermediate", "instructions": "Barbell deadlift"},
    
    # More exercises...
    {"name": "Burpees", "type": "cardio", "muscle": "cardio", "difficulty": "intermediate", "instructions": "Full body burpees"},
    {"name": "Mountain Climbers", "type": "cardio", "muscle": "abdominals", "difficulty": "intermediate", "instructions": "Mountain climber exercise"},
]


def get_exercises_by_goal(bmi: float, goal: str, difficulty: str = None, number: int = 8) -> list:
    """
    Get exercise recommendations based on BMI and goal.
    """
    api_key = os.getenv("API_NINJAS_KEY")
    
    # Map BMI to difficulty
    if not difficulty:
        if bmi < 18.5:
            diff = "beginner"
        elif bmi < 25:
            diff = "intermediate"
        else:
            diff = "beginner"  # Safe for overweight
    else:
        diff = difficulty
    
    # Map goal to muscle groups
    muscle_groups = {
        "weight_loss": ["cardio", "abdominals", "quadriceps"],
        "muscle_gain": ["chest", "back", "biceps", "triceps"],
        "maintenance": ["chest", "abdominals", "cardio"],
        "extreme_loss": ["cardio", "cardio", "abdominals"],
    }
    
    muscles = muscle_groups.get(goal, ["cardio", "chest", "abdominals"])
    all_exercises = []
    
    # Try API first
    for muscle in muscles:
        if api_key:
            batch = _fetch_from_api(muscle, diff, api_key, limit=3)
            all_exercises.extend(batch)
    
    # Fallback if API failed
    if not all_exercises:
        all_exercises = _get_fallback_exercises(muscles, diff, number)
    
    # Remove duplicates
    seen = set()
    unique = []
    for ex in all_exercises:
        if ex["name"] not in seen:
            seen.add(ex["name"])
            unique.append(ex)
    
    return unique[:number]


def _fetch_from_api(muscle: str, difficulty: str, api_key: str, limit: int = 5) -> list:
    """Fetch from API Ninjas - FIXED VERSION"""
    if not api_key:
        return []
    
    try:
        resp = requests.get(
            "https://api.api-ninjas.com/v1/exercises",
            headers={"X-Api-Key": api_key},
            params={"muscle": muscle, "difficulty": difficulty},
            timeout=10
        )
        resp.raise_for_status()
        results = resp.json()
        return results[:limit] if results else []
    except Exception as e:
        print(f"[ExerciseRecommender] API error: {e}")
        return []


def _get_fallback_exercises(muscles: list, difficulty: str, limit: int) -> list:
    """Get exercises from fallback database."""
    filtered = [
        ex for ex in FALLBACK_EXERCISES
        if ex["muscle"] in muscles or ex["type"] == "cardio"
    ]
    return filtered[:limit]


def get_workout_plan(bmi: float, goal: str) -> dict:
    """Generate 7-day workout plan."""
    diff = "beginner" if bmi >= 25 else "intermediate"
    
    plan = {
        "Monday": {"focus": "Upper Body", "exercises": get_exercises_by_goal(bmi, goal, diff, 4)},
        "Tuesday": {"focus": "Cardio", "exercises": get_exercises_by_goal(bmi, "weight_loss", diff, 3)},
        "Wednesday": {"focus": "Rest Day", "exercises": []},
        "Thursday": {"focus": "Lower Body", "exercises": get_exercises_by_goal(bmi, goal, diff, 4)},
        "Friday": {"focus": "Core", "exercises": get_exercises_by_goal(bmi, goal, diff, 3)},
        "Saturday": {"focus": "Full Body", "exercises": get_exercises_by_goal(bmi, goal, diff, 5)},
        "Sunday": {"focus": "Rest Day", "exercises": []},
    }
    
    return plan


def search_exercise_by_name(name: str) -> list:
    """Search exercises by name."""
    api_key = os.getenv("API_NINJAS_KEY")
    
    if api_key:
        try:
            resp = requests.get(
                "https://api.api-ninjas.com/v1/exercises",
                headers={"X-Api-Key": api_key},
                params={"name": name},
                timeout=10
            )
            resp.raise_for_status()
            return resp.json()
        except:
            pass
    
    # Fallback search
    return [ex for ex in FALLBACK_EXERCISES if name.lower() in ex["name"].lower()]