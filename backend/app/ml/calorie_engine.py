import math
from dataclasses import dataclass
from typing import Literal

# ── Activity multipliers (Mifflin-St Jeor) ──────────────────────────────────
ACTIVITY_MULTIPLIERS = {
    "sedentary":        1.2,
    "lightly_active":   1.375,
    "moderately_active":1.55,
    "very_active":      1.725,
    "extra_active":     1.9,
}

# ── Goal calorie adjustments ─────────────────────────────────────────────────
GOAL_ADJUSTMENTS = {
    "weight_loss":    -500,   # 500 kcal deficit  → ~0.45 kg/week loss
    "muscle_gain":    +300,   # 300 kcal surplus  → lean bulk
    "maintenance":      0,
    "extreme_loss":   -750,   # 750 kcal deficit  → aggressive cut
}

@dataclass
class HealthProfile:
    age:            int
    weight_kg:      float
    height_cm:      float
    gender:         Literal["male", "female", "other"]
    activity_level: str
    goal:           str
    # ── computed ──────────────────────────
    bmi:            float = 0.0
    bmi_category:   str  = ""
    bmr:            float = 0.0
    tdee:           float = 0.0
    target_calories:float = 0.0
    ideal_weight_min:float = 0.0
    ideal_weight_max:float = 0.0
    body_fat_est:   float = 0.0
    macros:         dict  = None


def calculate_bmi(weight_kg: float, height_cm: float) -> tuple[float, str]:
    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 1)
    if   bmi < 18.5: category = "Underweight"
    elif bmi < 25.0: category = "Normal Weight"
    elif bmi < 30.0: category = "Overweight"
    elif bmi < 35.0: category = "Obese (Class I)"
    elif bmi < 40.0: category = "Obese (Class II)"
    else:            category = "Obese (Class III)"
    return bmi, category


def calculate_bmr(weight_kg: float, height_cm: float,
                  age: int, gender: str) -> float:
    """Mifflin-St Jeor Equation"""
    if gender == "male":
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5, 1)
    else:  # female / other
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age - 161, 1)


def calculate_tdee(bmr: float, activity_level: str) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.375)
    return round(bmr * multiplier, 1)


def estimate_body_fat(bmi: float, age: int, gender: str) -> float:
    """Deurenberg formula"""
    gender_factor = 1 if gender == "male" else 0
    bf = 1.20 * bmi + 0.23 * age - 10.8 * gender_factor - 5.4
    return round(max(0.0, bf), 1)


def ideal_weight_range(height_cm: float) -> tuple[float, float]:
    """BMI 18.5–24.9 range"""
    h = height_cm / 100
    return round(18.5 * h ** 2, 1), round(24.9 * h ** 2, 1)


def calculate_macros(target_calories: float, goal: str) -> dict:
    """
    Returns gram amounts for protein / carbs / fat.
    Protein  : 30 % muscle_gain, 35 % weight_loss, 25 % maintenance
    Fat      : 25 % across the board
    Carbs    : remainder
    """
    if goal == "muscle_gain":
        p_pct, f_pct = 0.30, 0.25
    elif goal in ("weight_loss", "extreme_loss"):
        p_pct, f_pct = 0.35, 0.25
    else:
        p_pct, f_pct = 0.25, 0.25
    c_pct = 1 - p_pct - f_pct

    protein_g = round(target_calories * p_pct / 4, 1)
    fat_g     = round(target_calories * f_pct / 9, 1)
    carbs_g   = round(target_calories * c_pct / 4, 1)
    return {
        "protein_g": protein_g,
        "carbs_g":   carbs_g,
        "fat_g":     fat_g,
        "protein_pct": int(p_pct * 100),
        "carbs_pct":   int(c_pct * 100),
        "fat_pct":     int(f_pct * 100),
    }


def build_health_profile(data: dict) -> HealthProfile:
    age            = int(data["age"])
    weight_kg      = float(data["weight_kg"])
    height_cm      = float(data["height_cm"])
    gender         = data.get("gender", "male").lower()
    activity_level = data.get("activity_level", "moderately_active")
    goal           = data.get("goal", "maintenance")

    bmi, bmi_cat   = calculate_bmi(weight_kg, height_cm)
    bmr            = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee           = calculate_tdee(bmr, activity_level)
    adjustment     = GOAL_ADJUSTMENTS.get(goal, 0)
    target_cal     = round(tdee + adjustment, 1)
    iw_min, iw_max = ideal_weight_range(height_cm)
    body_fat       = estimate_body_fat(bmi, age, gender)
    macros         = calculate_macros(target_cal, goal)

    return HealthProfile(
        age=age, weight_kg=weight_kg, height_cm=height_cm,
        gender=gender, activity_level=activity_level, goal=goal,
        bmi=bmi, bmi_category=bmi_cat, bmr=bmr, tdee=tdee,
        target_calories=target_cal,
        ideal_weight_min=iw_min, ideal_weight_max=iw_max,
        body_fat_est=body_fat, macros=macros,
    )


def get_health_tips(profile: HealthProfile) -> list[str]:
    tips = []
    bmi = profile.bmi

    if bmi < 18.5:
        tips += [
            "Increase calorie intake with nutrient-dense foods like nuts, avocado & whole grains.",
            "Focus on strength training to build lean muscle mass.",
            "Eat 5–6 smaller meals throughout the day.",
        ]
    elif bmi < 25:
        tips += [
            "You're in a healthy BMI range — maintain it with balanced nutrition.",
            "Include at least 150 minutes of moderate activity per week.",
            "Stay hydrated: aim for 2.5–3 L of water daily.",
        ]
    elif bmi < 30:
        tips += [
            "Reduce processed sugar and refined carbs from your diet.",
            "Incorporate both cardio and resistance training for best results.",
            "Track your meals — awareness is the first step.",
        ]
    else:
        tips += [
            "Consult a healthcare professional for a personalised plan.",
            "Start with low-impact cardio like walking or swimming.",
            "Small consistent changes beat drastic diets every time.",
        ]

    if profile.goal == "muscle_gain":
        tips.append("Consume 1.6–2.2 g of protein per kg of body weight daily.")
        tips.append("Prioritise progressive overload in your workouts.")
    elif profile.goal in ("weight_loss", "extreme_loss"):
        tips.append("Eat protein-rich foods to preserve muscle while losing fat.")
        tips.append("Add 30 min of daily walking — it adds up fast.")

    return tips