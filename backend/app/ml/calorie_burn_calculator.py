"""
Calorie Burn Calculator
Calculates calories burned based on:
- Exercise type
- Duration (minutes)
- User weight
- Intensity level
"""

# MET (Metabolic Equivalent of Task) values for different exercises
# MET = ratio of working metabolic rate to resting metabolic rate
# Calories burned per minute = (MET × body weight in kg × 3.5) / 200

EXERCISE_MET_VALUES = {
    # Cardio (High burn)
    "running_8mph":        11.5,   # Fast running
    "running_6mph":        9.8,    # Moderate running
    "running_5mph":        8.3,    # Jogging
    "cycling_fast":        12.0,   # >20 mph
    "cycling_moderate":    8.0,    # 12-14 mph
    "cycling_light":       5.8,    # <10 mph
    "swimming_vigorous":   10.0,   # Fast laps
    "swimming_moderate":   7.0,    # Leisure
    "jump_rope":           12.3,   # Very high intensity
    "hiit":                12.0,   # High intensity interval
    "stair_climbing":      9.0,
    "elliptical":          7.0,
    "rowing_machine":      8.5,
    "walking_4mph":        5.0,    # Brisk walk
    "walking_3mph":        3.5,    # Casual walk
    "walking_2mph":        2.5,    # Slow walk
    
    # Strength Training (Moderate burn)
    "weight_lifting_vigorous": 6.0,
    "weight_lifting_moderate": 5.0,
    "weight_lifting_light":    3.0,
    "bodyweight_circuit":      7.0,
    "push_ups":               8.0,   # Vigorous
    "pull_ups":               8.0,
    "squats":                 5.0,   # Bodyweight
    "lunges":                 4.0,
    "planks":                 3.8,
    "crunches":               3.8,
    "burpees":                8.0,   # Very intense
    
    # Sports (Variable)
    "basketball_game":        8.0,
    "basketball_practice":    6.0,
    "football_game":          8.0,
    "soccer_game":            10.0,
    "tennis_singles":         8.0,
    "tennis_doubles":         6.0,
    "badminton":              7.0,
    "cricket":                5.5,
    "volleyball":             6.0,
    "table_tennis":           4.0,
    
    # Yoga & Stretching (Light burn)
    "yoga_power":             4.0,
    "yoga_hatha":             2.5,
    "pilates":                3.0,
    "stretching":             2.3,
    
    # Dance & Aerobics
    "dance_aerobic":          7.3,
    "dance_ballet":           5.0,
    "zumba":                  8.8,
    "aerobics_high":          7.0,
    "aerobics_low":           5.0,
    
    # Outdoor Activities
    "hiking_uphill":          7.0,
    "hiking_flat":            5.0,
    "rock_climbing":          8.0,
    "kayaking":               5.0,
    "surfing":                3.0,
    
    # Household & Misc
    "gardening":              4.0,
    "cleaning_house":         3.5,
    "moving_furniture":       6.0,
    "playing_with_kids":      5.8,
}


def calculate_calories_burned(
    exercise_type: str,
    duration_minutes: float,
    weight_kg: float,
    intensity_multiplier: float = 1.0
) -> dict:
    """
    Calculate calories burned for an exercise session.
    
    Args:
        exercise_type: Type of exercise (must be in EXERCISE_MET_VALUES)
        duration_minutes: Duration of exercise in minutes
        weight_kg: User's weight in kilograms
        intensity_multiplier: Adjust for personal intensity (0.8 = light, 1.0 = normal, 1.2 = vigorous)
    
    Returns:
        dict with calories_burned, met_value, breakdown
    """
    # Get base MET value
    exercise_key = exercise_type.lower().replace(" ", "_")
    met = EXERCISE_MET_VALUES.get(exercise_key, 5.0)  # Default to moderate if unknown
    
    # Adjust for intensity
    adjusted_met = met * intensity_multiplier
    
    # Formula: Calories/min = (MET × weight_kg × 3.5) / 200
    calories_per_minute = (adjusted_met * weight_kg * 3.5) / 200
    total_calories = calories_per_minute * duration_minutes
    
    return {
        "exercise_type":       exercise_type,
        "duration_minutes":    duration_minutes,
        "calories_burned":     round(total_calories, 1),
        "calories_per_minute": round(calories_per_minute, 2),
        "met_value":           adjusted_met,
        "intensity":           _get_intensity_label(intensity_multiplier),
        "weight_kg":           weight_kg,
    }


def get_exercise_recommendations_by_burn_goal(
    target_calories: int,
    available_time_minutes: int,
    weight_kg: float,
    preference: str = "moderate"  # light, moderate, intense
) -> list[dict]:
    """
    Recommend exercises to meet calorie burn goal.
    
    Args:
        target_calories: How many calories user wants to burn
        available_time_minutes: How much time they have
        weight_kg: User weight
        preference: Intensity preference
    
    Returns:
        List of exercise recommendations
    """
    intensity_map = {
        "light":    0.8,
        "moderate": 1.0,
        "intense":  1.2,
    }
    intensity_mult = intensity_map.get(preference, 1.0)
    
    # Filter exercises by intensity preference
    if preference == "light":
        exercise_pool = {k: v for k, v in EXERCISE_MET_VALUES.items() if v < 6.0}
    elif preference == "intense":
        exercise_pool = {k: v for k, v in EXERCISE_MET_VALUES.items() if v > 8.0}
    else:
        exercise_pool = EXERCISE_MET_VALUES
    
    recommendations = []
    
    for ex_type, met in sorted(exercise_pool.items(), key=lambda x: x[1], reverse=True)[:10]:
        result = calculate_calories_burned(
            exercise_type=ex_type,
            duration_minutes=available_time_minutes,
            weight_kg=weight_kg,
            intensity_multiplier=intensity_mult
        )
        
        if result["calories_burned"] >= target_calories * 0.5:  # At least 50% of goal
            recommendations.append({
                **result,
                "meets_goal": result["calories_burned"] >= target_calories,
                "percentage_of_goal": round((result["calories_burned"] / target_calories) * 100, 1)
            })
    
    return recommendations[:6]  # Top 6 recommendations


def estimate_exercise_duration(
    target_calories: int,
    exercise_type: str,
    weight_kg: float,
    intensity_multiplier: float = 1.0
) -> dict:
    """
    Calculate how long to exercise to burn target calories.
    
    Returns:
        dict with duration_minutes needed
    """
    exercise_key = exercise_type.lower().replace(" ", "_")
    met = EXERCISE_MET_VALUES.get(exercise_key, 5.0)
    adjusted_met = met * intensity_multiplier
    
    calories_per_minute = (adjusted_met * weight_kg * 3.5) / 200
    duration_needed = target_calories / calories_per_minute
    
    return {
        "exercise_type":      exercise_type,
        "target_calories":    target_calories,
        "duration_minutes":   round(duration_needed, 1),
        "duration_formatted": f"{int(duration_needed)} min" if duration_needed < 60 else f"{duration_needed/60:.1f} hrs",
        "calories_per_minute": round(calories_per_minute, 2),
    }


def get_all_exercise_types() -> list[dict]:
    """Return all available exercise types with their MET values."""
    return [
        {
            "exercise_type": k.replace("_", " ").title(),
            "key": k,
            "met_value": v,
            "intensity": "High" if v > 8 else "Moderate" if v > 5 else "Light",
            "category": _categorize_exercise(k)
        }
        for k, v in sorted(EXERCISE_MET_VALUES.items(), key=lambda x: x[1], reverse=True)
    ]


# Helper functions
def _get_intensity_label(multiplier: float) -> str:
    if multiplier < 0.9:
        return "Light"
    elif multiplier > 1.1:
        return "Vigorous"
    else:
        return "Moderate"


def _categorize_exercise(exercise_key: str) -> str:
    if any(x in exercise_key for x in ["running", "cycling", "swimming", "jump", "hiit", "walking"]):
        return "Cardio"
    elif any(x in exercise_key for x in ["weight", "push", "pull", "squat", "lunge", "plank", "burpee"]):
        return "Strength"
    elif any(x in exercise_key for x in ["yoga", "pilates", "stretch"]):
        return "Flexibility"
    elif any(x in exercise_key for x in ["basketball", "football", "soccer", "tennis", "cricket"]):
        return "Sports"
    elif any(x in exercise_key for x in ["dance", "zumba", "aerobic"]):
        return "Dance"
    else:
        return "Other"