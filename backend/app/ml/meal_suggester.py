import requests
import random
import os
from typing import Optional
from flask import current_app

SPOONACULAR_BASE = "https://api.spoonacular.com"

DIET_MAP = {
    "veg":      "vegetarian",
    "vegan":    "vegan",
    "non_veg":  None,
    "keto":     "ketogenic",
    "paleo":    "paleo",
    "gluten_free": "gluten free",
}

VALID_CUISINES = [
    "Indian", "Italian", "Mexican", "Mediterranean", "Asian",
    "American", "Thai", "Chinese", "Japanese", "French",
]

# FIXED: field names now use title/calories/protein/carbs/fat (not name/cal/p/c/f)
FALLBACK_MEALS = {
    "breakfast": [
        {"title": "Oatmeal with Berries", "calories": 350, "protein": 12, "carbs": 60, "fat": 8, "readyInMinutes": 10},
        {"title": "Greek Yogurt Parfait", "calories": 280, "protein": 20, "carbs": 35, "fat": 6, "readyInMinutes": 5},
        {"title": "Scrambled Eggs with Toast", "calories": 320, "protein": 18, "carbs": 30, "fat": 12, "readyInMinutes": 10},
        {"title": "Protein Pancakes", "calories": 400, "protein": 25, "carbs": 45, "fat": 10, "readyInMinutes": 15},
        {"title": "Avocado Toast", "calories": 350, "protein": 10, "carbs": 40, "fat": 15, "readyInMinutes": 8},
        {"title": "Smoothie Bowl", "calories": 380, "protein": 15, "carbs": 55, "fat": 12, "readyInMinutes": 5},
        {"title": "Egg White Omelette", "calories": 250, "protein": 22, "carbs": 10, "fat": 8, "readyInMinutes": 10},
        {"title": "Whole Grain Cereal", "calories": 300, "protein": 10, "carbs": 50, "fat": 6, "readyInMinutes": 5},
        {"title": "Breakfast Burrito", "calories": 420, "protein": 20, "carbs": 48, "fat": 15, "readyInMinutes": 15},
        {"title": "Poha (Indian)", "calories": 300, "protein": 8, "carbs": 50, "fat": 8, "readyInMinutes": 15},
        {"title": "Upma (Indian)", "calories": 280, "protein": 6, "carbs": 45, "fat": 9, "readyInMinutes": 20},
        {"title": "Idli Sambar", "calories": 320, "protein": 10, "carbs": 55, "fat": 5, "readyInMinutes": 20},
    ],
    "lunch": [
        {"title": "Grilled Chicken Salad", "calories": 420, "protein": 35, "carbs": 25, "fat": 18, "readyInMinutes": 20},
        {"title": "Quinoa Buddha Bowl", "calories": 480, "protein": 18, "carbs": 65, "fat": 15, "readyInMinutes": 25},
        {"title": "Turkey Sandwich", "calories": 450, "protein": 28, "carbs": 50, "fat": 14, "readyInMinutes": 10},
        {"title": "Salmon with Vegetables", "calories": 520, "protein": 40, "carbs": 30, "fat": 22, "readyInMinutes": 25},
        {"title": "Chicken Burrito Bowl", "calories": 550, "protein": 35, "carbs": 60, "fat": 18, "readyInMinutes": 20},
        {"title": "Tuna Salad Wrap", "calories": 380, "protein": 30, "carbs": 35, "fat": 12, "readyInMinutes": 10},
        {"title": "Stir-Fried Tofu", "calories": 400, "protein": 22, "carbs": 45, "fat": 15, "readyInMinutes": 20},
        {"title": "Pasta Primavera", "calories": 480, "protein": 15, "carbs": 70, "fat": 12, "readyInMinutes": 25},
        {"title": "Dal Rice (Indian)", "calories": 450, "protein": 18, "carbs": 75, "fat": 8, "readyInMinutes": 30},
        {"title": "Chicken Curry with Roti", "calories": 520, "protein": 35, "carbs": 55, "fat": 15, "readyInMinutes": 35},
        {"title": "Chole Bhature", "calories": 580, "protein": 15, "carbs": 80, "fat": 20, "readyInMinutes": 40},
        {"title": "Rajma Chawal", "calories": 480, "protein": 18, "carbs": 70, "fat": 12, "readyInMinutes": 35},
    ],
    "dinner": [
        {"title": "Baked Cod with Broccoli", "calories": 380, "protein": 35, "carbs": 25, "fat": 15, "readyInMinutes": 30},
        {"title": "Chicken Stir-Fry", "calories": 450, "protein": 32, "carbs": 40, "fat": 16, "readyInMinutes": 25},
        {"title": "Beef Tacos", "calories": 480, "protein": 28, "carbs": 45, "fat": 20, "readyInMinutes": 25},
        {"title": "Vegetable Lasagna", "calories": 420, "protein": 18, "carbs": 50, "fat": 16, "readyInMinutes": 45},
        {"title": "Grilled Steak with Sweet Potato", "calories": 550, "protein": 42, "carbs": 45, "fat": 22, "readyInMinutes": 30},
        {"title": "Shrimp Pasta", "calories": 480, "protein": 30, "carbs": 55, "fat": 15, "readyInMinutes": 25},
        {"title": "Turkey Meatballs", "calories": 420, "protein": 35, "carbs": 30, "fat": 18, "readyInMinutes": 35},
        {"title": "Paneer Tikka Masala", "calories": 480, "protein": 20, "carbs": 45, "fat": 22, "readyInMinutes": 35},
        {"title": "Fish Curry with Rice", "calories": 460, "protein": 32, "carbs": 50, "fat": 14, "readyInMinutes": 35},
        {"title": "Palak Paneer with Roti", "calories": 420, "protein": 18, "carbs": 48, "fat": 16, "readyInMinutes": 30},
        {"title": "Butter Chicken", "calories": 520, "protein": 35, "carbs": 40, "fat": 24, "readyInMinutes": 35},
    ],
    "snack": [
        {"title": "Almonds (1 oz)", "calories": 160, "protein": 6, "carbs": 6, "fat": 14, "readyInMinutes": 0},
        {"title": "Apple with Peanut Butter", "calories": 180, "protein": 4, "carbs": 22, "fat": 8, "readyInMinutes": 2},
        {"title": "Protein Bar", "calories": 200, "protein": 15, "carbs": 20, "fat": 7, "readyInMinutes": 0},
        {"title": "Greek Yogurt", "calories": 150, "protein": 15, "carbs": 12, "fat": 4, "readyInMinutes": 0},
        {"title": "Hummus with Veggies", "calories": 140, "protein": 5, "carbs": 15, "fat": 7, "readyInMinutes": 5},
        {"title": "Trail Mix", "calories": 190, "protein": 6, "carbs": 18, "fat": 12, "readyInMinutes": 0},
        {"title": "Cottage Cheese", "calories": 120, "protein": 14, "carbs": 8, "fat": 3, "readyInMinutes": 0},
        {"title": "Banana with Almond Butter", "calories": 200, "protein": 5, "carbs": 28, "fat": 9, "readyInMinutes": 2},
        {"title": "Roasted Chickpeas", "calories": 150, "protein": 7, "carbs": 22, "fat": 4, "readyInMinutes": 0},
        {"title": "Fruit Smoothie", "calories": 180, "protein": 8, "carbs": 30, "fat": 3, "readyInMinutes": 5},
    ]
}


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
) -> list:
    api_key = _get_api_key()
    if not api_key:
        return _fallback_for_mealtype(meal_type, number)

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
            verify=False
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
    api_key = _get_api_key()
    if not api_key:
        return None
    try:
        resp = requests.get(
            f"{SPOONACULAR_BASE}/recipes/{recipe_id}/information",
            params={"apiKey": api_key, "includeNutrition": True},
            timeout=10,
            verify=False
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "id":             data.get("id"),
            "title":          data.get("title"),
            "image":          data.get("image"),
            "readyInMinutes": data.get("readyInMinutes"),
            "servings":       data.get("servings"),
            "sourceUrl":      data.get("sourceUrl"),
            "instructions":   data.get("instructions", ""),
            "ingredients":    [i["original"] for i in data.get("extendedIngredients", [])],
            "nutrition":      _extract_nutrition(data.get("nutrition", {})),
        }
    except requests.exceptions.RequestException as e:
        print(f"[MealSuggester] Recipe detail error: {e}")
        return None


def _parse_recipe(r: dict) -> dict:
    nutrition = r.get("nutrition", {})
    nutrients = {n["name"]: n["amount"] for n in nutrition.get("nutrients", [])}
    return {
        "id":             r.get("id"),
        "title":          r.get("title", "Unknown"),
        "image":          r.get("image", ""),
        "calories":       round(nutrients.get("Calories", 0), 1),
        "protein":        round(nutrients.get("Protein", 0), 1),
        "carbs":          round(nutrients.get("Carbohydrates", 0), 1),
        "fat":            round(nutrients.get("Fat", 0), 1),
        "fiber":          round(nutrients.get("Fiber", 0), 1),
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


def _fallback_for_mealtype(meal_type: str, number: int) -> list:
    fallback = list(FALLBACK_MEALS.get(meal_type, FALLBACK_MEALS["lunch"]))
    random.shuffle(fallback)
    return fallback[:number]