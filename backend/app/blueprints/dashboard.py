from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from ..database import get_db
from ..ml.calorie_engine import get_health_tips, build_health_profile

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Last 7 days of meal logs
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    meal_logs = list(db.meal_logs.find({
        "user_id": user_id,
        "date": {"$gte": seven_days_ago}
    }).sort("date", -1))

    exercise_logs = list(db.exercise_logs.find({
        "user_id": user_id,
        "date": {"$gte": seven_days_ago}
    }).sort("date", -1))

    # Daily calorie chart data (last 7 days)
    daily_calories = {}
    for log in meal_logs:
        day = log["date"].strftime("%a")
        daily_calories[day] = daily_calories.get(day, 0) + log.get("calories", 0)

    # Build profile for tips
    profile = build_health_profile({
        "age":            user.get("age", 25),
        "weight_kg":      user.get("weight_kg", 70),
        "height_cm":      user.get("height_cm", 170),
        "gender":         user.get("gender", "male"),
        "activity_level": user.get("activity_level", "moderately_active"),
        "goal":           user.get("goal", "maintenance"),
    })
    tips = get_health_tips(profile)

    total_calories_burned = sum(l.get("calories_burned", 0) for l in exercise_logs)
    total_calories_consumed = sum(l.get("calories", 0) for l in meal_logs)

    return jsonify({
        "user": {
            "full_name":       user.get("full_name", user.get("username")),
            "bmi":             user.get("bmi"),
            "bmi_category":    user.get("bmi_category"),
            "target_calories": user.get("target_calories"),
            "goal":            user.get("goal"),
            "streak":          user.get("streak", 0),
        },
        "stats": {
            "total_calories_consumed":  round(total_calories_consumed, 1),
            "total_calories_burned":    round(total_calories_burned, 1),
            "net_calories":             round(total_calories_consumed - total_calories_burned, 1),
            "meals_logged":             len(meal_logs),
            "exercises_logged":         len(exercise_logs),
            "saved_workouts":           db.saved_workouts.count_documents({"user_id": user_id}),
        },
        "daily_calories":   daily_calories,
        "health_tips":      tips[:3],
        "macros":           user.get("macros", {}),
        "recent_meals":     _serialize_list(meal_logs[:5]),
        "recent_exercises": _serialize_list(exercise_logs[:5]),
    }), 200


def _serialize_list(items):
    result = []
    for item in items:
        item["_id"] = str(item["_id"])
        if "date" in item:
            item["date"] = item["date"].isoformat()
        result.append(item)
    return result