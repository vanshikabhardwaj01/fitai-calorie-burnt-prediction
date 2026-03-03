import requests
import random
import os
from typing import Optional
from flask import current_app

SPOONACULAR_BASE = "https://api.spoonacular.com"

# ── Diet type mapping ────────────────────────────────────────────────────────
DIET_MAP = {
    "veg":      "vegetarian",
    "vegan":    "vegan",
    "non_veg":  None,           # no restriction
    "keto":     "ketogenic",
    "paleo":    "paleo",
    "gluten_free": "gluten free",
}

# ── Cuisine list supported by Spoonacular ────────────────────────────────────
VALID_CUISINES = [
    "Indian", "Italian", "Mexican", "Mediterranean", "Asian",
    "American", "Thai", "Chinese", "Japanese", "French",
]

# ── Fallback meals when API key is missing / quota exceeded ──────────────────
# Expanded fallback meals database with variety
FALLBACK_MEALS = {
    "breakfast": [
        {"name": "Oatmeal with Berries", "cal": 350, "p": 12, "c": 60, "f": 8},
        {"name": "Greek Yogurt Parfait", "cal": 280, "p": 20, "c": 35, "f": 6},
        {"name": "Scrambled Eggs with Toast", "cal": 320, "p": 18, "c": 30, "f": 12},
        {"name": "Protein Pancakes", "cal": 400, "p": 25, "c": 45, "f": 10},
        {"name": "Avocado Toast", "cal": 350, "p": 10, "c": 40, "f": 15},
        {"name": "Smoothie Bowl", "cal": 380, "p": 15, "c": 55, "f": 12},
        {"name": "Egg White Omelette", "cal": 250, "p": 22, "c": 10, "f": 8},
        {"name": "Whole Grain Cereal", "cal": 300, "p": 10, "c": 50, "f": 6},
        {"name": "Breakfast Burrito", "cal": 420, "p": 20, "c": 48, "f": 15},
        {"name": "Poha (Indian)", "cal": 300, "p": 8, "c": 50, "f": 8},
        {"name": "Upma (Indian)", "cal": 280, "p": 6, "c": 45, "f": 9},
        {"name": "Idli Sambar", "cal": 320, "p": 10, "c": 55, "f": 5},
    ],
    "lunch": [
        {"name": "Grilled Chicken Salad", "cal": 420, "p": 35, "c": 25, "f": 18},
        {"name": "Quinoa Buddha Bowl", "cal": 480, "p": 18, "c": 65, "f": 15},
        {"name": "Turkey Sandwich", "cal": 450, "p": 28, "c": 50, "f": 14},
        {"name": "Salmon with Vegetables", "cal": 520, "p": 40, "c": 30, "f": 22},
        {"name": "Chicken Burrito Bowl", "cal": 550, "p": 35, "c": 60, "f": 18},
        {"name": "Tuna Salad Wrap", "cal": 380, "p": 30, "c": 35, "f": 12},
        {"name": "Stir-Fried Tofu", "cal": 400, "p": 22, "c": 45, "f": 15},
        {"name": "Pasta Primavera", "cal": 480, "p": 15, "c": 70, "f": 12},
        {"name": "Dal Rice (Indian)", "cal": 450, "p": 18, "c": 75, "f": 8},
        {"name": "Chicken Curry with Roti", "cal": 520, "p": 35, "c": 55, "f": 15},
        {"name": "Chole Bhature", "cal": 580, "p": 15, "c": 80, "f": 20},
        {"name": "Rajma Chawal", "cal": 480, "p": 18, "c": 70, "f": 12},
    ],
    "dinner": [
        {"name": "Baked Cod with Broccoli", "cal": 380, "p": 35, "c": 25, "f": 15},
        {"name": "Chicken Stir-Fry", "cal": 450, "p": 32, "c": 40, "f": 16},
        {"name": "Beef Tacos", "cal": 480, "p": 28, "c": 45, "f": 20},
        {"name": "Vegetable Lasagna", "cal": 420, "p": 18, "c": 50, "f": 16},
        {"name": "Grilled Steak with Sweet Potato", "cal": 550, "p": 42, "c": 45, "f": 22},
        {"name": "Shrimp Pasta", "cal": 480, "p": 30, "c": 55, "f": 15},
        {"name": "Turkey Meatballs", "cal": 420, "p": 35, "c": 30, "f": 18},
        {"name": "Paneer Tikka Masala", "cal": 480, "p": 20, "c": 45, "f": 22},
        {"name": "Fish Curry with Rice", "cal": 460, "p": 32, "c": 50, "f": 14},
        {"name": "Palak Paneer with Roti", "cal": 420, "p": 18, "c": 48, "f": 16},
        {"name": "Butter Chicken", "cal": 520, "p": 35, "c": 40, "f": 24},
    ],
    "snack": [
        {"name": "Almonds (1 oz)", "cal": 160, "p": 6, "c": 6, "f": 14},
        {"name": "Apple with Peanut Butter", "cal": 180, "p": 4, "c": 22, "f": 8},
        {"name": "Protein Bar", "cal": 200, "p": 15, "c": 20, "f": 7},
        {"name": "Greek Yogurt", "cal": 150, "p": 15, "c": 12, "f": 4},
        {"name": "Hummus with Veggies", "cal": 140, "p": 5, "c": 15, "f": 7},
        {"name": "Trail Mix", "cal": 190, "p": 6, "c": 18, "f": 12},
        {"name": "Cottage Cheese", "cal": 120, "p": 14, "c": 8, "f": 3},
        {"name": "Banana with Almond Butter", "cal": 200, "p": 5, "c": 28, "f": 9},
        {"name": "Roasted Chickpeas", "cal": 150, "p": 7, "c": 22, "f": 4},
        {"name": "Fruit Smoothie", "cal": 180, "p": 8, "c": 30, "f": 3},
    ]
}


def get_meals_for_meal_type(meal_type: str, target_cals: int, diet_type: str = None, cuisine: str = None, api_key: str = None) -> list:
    """Get 3 meal options for a meal type."""
    if api_key:
        try:
            # Try API first
            meals = _fetch_from_spoonacular(meal_type, target_cals, diet_type, cuisine, api_key)
            if meals:
                return meals
        except:
            pass
    
    # Fallback with RANDOMIZATION
    candidates = FALLBACK_MEALS.get(meal_type, [])
    
    # Filter by calorie range
    min_cal = target_cals * 0.7
    max_cal = target_cals * 1.5
    filtered = [m for m in candidates if min_cal <= m["cal"] <= max_cal]
    
    if not filtered:
        filtered = candidates
    
    # RANDOMIZE and return 3 different options
    random.shuffle(filtered)
    return filtered[:3] 

def _get_api_key():
    try:
        return current_app.config.get("SPOONACULAR_API_KEY", "")
    except RuntimeError:
        return os.getenv("SPOONACULAR_API_KEY", "")


def search_meals(
    target_calories: float,
    diet_type: str = "non_veg",
    cuisine: Optional[str] = None,
    meal_type: str = "lunch",
    number: int = 6,
) -> list[dict]:
    """Fetch meals from Spoonacular matching calorie targets and preferences."""
    api_key = _get_api_key()
    if not api_key:
        return _fallback_for_mealtype(meal_type, number)

    # Per-meal calorie split
    splits = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10}
    pct = splits.get(meal_type, 0.30)
    min_cal = int(target_calories * pct * 0.80)
    max_cal = int(target_calories * pct * 1.20)

    params = {
        "apiKey":       api_key,
        "type":         meal_type,
        "minCalories":  min_cal,
        "maxCalories":  max_cal,
        "number":       number,
        "addRecipeNutrition": True,
        "sort":         "calories",
        "sortDirection":"asc",
    }

    diet = DIET_MAP.get(diet_type)
    if diet:
        params["diet"] = diet
    if cuisine and cuisine in VALID_CUISINES:
        params["cuisine"] = cuisine

    try:
        resp = requests.get(
            f"{SPOONACULAR_BASE}/recipes/complexSearch",
            params=params,
            timeout=10,
           verify=False  # ← ADD THIS LINE
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        return [_parse_recipe(r) for r in results] or _fallback_for_mealtype(meal_type, number)
    except requests.exceptions.RequestException as e:
        print(f"[MealSuggester] Spoonacular error: {e}")
        return _fallback_for_mealtype(meal_type, number)


def get_full_day_plan(
    target_calories: float,
    diet_type: str = "non_veg",
    cuisine: Optional[str] = None,
) -> dict:
    """Return a structured full-day meal plan."""
    plan = {}
    for meal_type in ["breakfast", "lunch", "dinner", "snack"]:
        plan[meal_type] = search_meals(
            target_calories=target_calories,
            diet_type=diet_type,
            cuisine=cuisine,
            meal_type=meal_type,
            number=3,
        )
    return plan


def get_recipe_detail(recipe_id: int) -> Optional[dict]:
    """Fetch detailed recipe info including steps."""
    api_key = _get_api_key()
    if not api_key:
        return None
    try:
        resp = requests.get(
            f"{SPOONACULAR_BASE}/recipes/{recipe_id}/information",
            params={"apiKey": api_key, "includeNutrition": True},
            timeout=10,
                verify=False  # ← ADD THIS LINE
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "id":           data.get("id"),
            "title":        data.get("title"),
            "image":        data.get("image"),
            "readyInMinutes": data.get("readyInMinutes"),
            "servings":     data.get("servings"),
            "sourceUrl":    data.get("sourceUrl"),
            "instructions": data.get("instructions", ""),
            "ingredients":  [i["original"] for i in data.get("extendedIngredients", [])],
            "nutrition":    _extract_nutrition(data.get("nutrition", {})),
        }
    except requests.exceptions.RequestException as e:
        print(f"[MealSuggester] Recipe detail error: {e}")
        return None


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_recipe(r: dict) -> dict:
    nutrition = r.get("nutrition", {})
    nutrients  = {n["name"]: n["amount"] for n in nutrition.get("nutrients", [])}
    return {
        "id":       r.get("id"),
        "title":    r.get("title", "Unknown"),
        "image":    r.get("image", ""),
        "calories": round(nutrients.get("Calories", 0), 1),
        "protein":  round(nutrients.get("Protein", 0), 1),
        "carbs":    round(nutrients.get("Carbohydrates", 0), 1),
        "fat":      round(nutrients.get("Fat", 0), 1),
        "fiber":    round(nutrients.get("Fiber", 0), 1),
        "readyInMinutes": r.get("readyInMinutes", 30),
    }


def _extract_nutrition(nutrition: dict) -> dict:
    nutrients = {n["name"]: n["amount"] for n in nutrition.get("nutrients", [])}
    return {
        "calories": round(nutrients.get("Calories", 0), 1),
        "protein":  round(nutrients.get("Protein", 0), 1),
        "carbs":    round(nutrients.get("Carbohydrates", 0), 1),
        "fat":      round(nutrients.get("Fat", 0), 1),
        "fiber":    round(nutrients.get("Fiber", 0), 1),
        "sugar":    round(nutrients.get("Sugar", 0), 1),
        "sodium":   round(nutrients.get("Sodium", 0), 1),
    }


def _fallback_for_mealtype(meal_type: str, number: int) -> list[dict]:
    fallback = FALLBACK_MEALS.get(meal_type, FALLBACK_MEALS["lunch"])
    return fallback[:number]