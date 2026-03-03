from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from ..database import get_db
from ..ml.exercise_recommender import get_exercises_by_goal, get_workout_plan, search_exercise_by_name
from ..ml.calorie_burn_calculator import (
    calculate_calories_burned,
    get_exercise_recommendations_by_burn_goal,
    estimate_exercise_duration,
    get_all_exercise_types
)

exercise_bp = Blueprint("exercise", __name__)


@exercise_bp.route("/suggestions", methods=["GET"])
@jwt_required()
def suggestions():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    bmi        = user.get("bmi", 22.0)
    goal       = request.args.get("goal") or user.get("goal", "maintenance")
    difficulty = request.args.get("difficulty")
    number     = int(request.args.get("number", 8))

    exercises = get_exercises_by_goal(bmi, goal, difficulty, number)
    return jsonify({
        "bmi":        bmi,
        "goal":       goal,
        "exercises":  exercises,
        "count":      len(exercises),
    }), 200


@exercise_bp.route("/weekly-plan", methods=["GET"])
@jwt_required()
def weekly_plan():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    bmi  = user.get("bmi", 22.0)
    goal = request.args.get("goal") or user.get("goal", "maintenance")
    plan = get_workout_plan(bmi, goal)
    return jsonify({"plan": plan, "bmi": bmi, "goal": goal}), 200


@exercise_bp.route("/search", methods=["GET"])
@jwt_required()
def search():
    name = request.args.get("name", "")
    if not name:
        return jsonify({"error": "name query param required"}), 400
    results = search_exercise_by_name(name)
    return jsonify({"exercises": results, "count": len(results)}), 200


@exercise_bp.route("/types", methods=["GET"])
@jwt_required()
def exercise_types():
    """Get all available exercise types with MET values."""
    types = get_all_exercise_types()
    return jsonify({"exercise_types": types, "count": len(types)}), 200


@exercise_bp.route("/calculate-burn", methods=["POST"])
@jwt_required()
def calculate_burn():
    """Calculate calories burned for a specific exercise."""
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json(silent=True) or {}
    
    exercise_type     = data.get("exercise_type", "").lower().replace(" ", "_")
    duration_minutes  = float(data.get("duration_minutes", 0))
    intensity         = data.get("intensity", "moderate")  # light, moderate, vigorous
    
    intensity_map = {"light": 0.8, "moderate": 1.0, "vigorous": 1.2}
    intensity_mult = intensity_map.get(intensity, 1.0)
    
    result = calculate_calories_burned(
        exercise_type=exercise_type,
        duration_minutes=duration_minutes,
        weight_kg=user.get("weight_kg", 70),
        intensity_multiplier=intensity_mult
    )
    
    return jsonify(result), 200


@exercise_bp.route("/recommend-by-burn", methods=["POST"])
@jwt_required()
def recommend_by_burn():
    """Recommend exercises to meet calorie burn goal."""
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json(silent=True) or {}
    
    target_calories  = int(data.get("target_calories", 300))
    available_time   = int(data.get("available_time_minutes", 30))
    preference       = data.get("preference", "moderate")  # light, moderate, intense
    
    recommendations = get_exercise_recommendations_by_burn_goal(
        target_calories=target_calories,
        available_time_minutes=available_time,
        weight_kg=user.get("weight_kg", 70),
        preference=preference
    )
    
    return jsonify({
        "target_calories": target_calories,
        "available_time":  available_time,
        "recommendations": recommendations,
        "count":           len(recommendations)
    }), 200


@exercise_bp.route("/estimate-duration", methods=["POST"])
@jwt_required()
def estimate_duration_endpoint():
    """Estimate how long to exercise to burn target calories."""
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json(silent=True) or {}
    
    result = estimate_exercise_duration(
        target_calories=int(data.get("target_calories", 300)),
        exercise_type=data.get("exercise_type", "running_5mph"),
        weight_kg=user.get("weight_kg", 70),
        intensity_multiplier=1.0
    )
    
    return jsonify(result), 200


@exercise_bp.route("/save", methods=["POST"])
@jwt_required()
def save_workout():
    db      = get_db()
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}

    workout = {
        "user_id":    user_id,
        "name":       data.get("name", "Custom Workout"),
        "exercises":  data.get("exercises", []),
        "goal":       data.get("goal", "maintenance"),
        "duration_min": data.get("duration_min", 45),
        "notes":      data.get("notes", ""),
        "saved_at":   datetime.now(timezone.utc),
    }
    result = db.saved_workouts.insert_one(workout)
    workout["_id"] = str(result.inserted_id)
    return jsonify({"message": "Workout saved!", "workout": workout}), 201


@exercise_bp.route("/saved", methods=["GET"])
@jwt_required()
def get_saved():
    db      = get_db()
    user_id = get_jwt_identity()
    saved   = list(db.saved_workouts.find({"user_id": user_id}).sort("saved_at", -1))
    for w in saved:
        w["_id"] = str(w["_id"])
    return jsonify({"workouts": saved, "count": len(saved)}), 200


@exercise_bp.route("/saved/<workout_id>", methods=["DELETE"])
@jwt_required()
def delete_saved(workout_id):
    db      = get_db()
    user_id = get_jwt_identity()
    result  = db.saved_workouts.delete_one({"_id": ObjectId(workout_id), "user_id": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Workout not found"}), 404
    return jsonify({"message": "Workout deleted"}), 200


@exercise_bp.route("/log", methods=["POST"])
@jwt_required()
def log_exercise():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    data    = request.get_json(silent=True) or {}

    # Calculate calories if not provided
    calories_burned = data.get("calories_burned", 0)
    if not calories_burned and data.get("exercise_type") and data.get("duration_minutes"):
        result = calculate_calories_burned(
            exercise_type=data["exercise_type"],
            duration_minutes=float(data["duration_minutes"]),
            weight_kg=user.get("weight_kg", 70),
            intensity_multiplier=1.0
        )
        calories_burned = result["calories_burned"]

    log_entry = {
        "user_id":         user_id,
        "exercise_name":   data.get("exercise_name", data.get("exercise_type", "")),
        "exercise_type":   data.get("exercise_type", ""),
        "duration_minutes":data.get("duration_minutes", 0),
        "sets_completed":  data.get("sets_completed", 0),
        "reps_completed":  data.get("reps_completed", 0),
        "calories_burned": calories_burned,
        "intensity":       data.get("intensity", "moderate"),
        "notes":           data.get("notes", ""),
        "date":            datetime.now(timezone.utc),
    }
    db.exercise_logs.insert_one(log_entry)
    log_entry["_id"] = str(log_entry["_id"])

    # Update streak
    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"streak": 1, "total_logs": 1}})
    return jsonify({"message": "Exercise logged!", "log": log_entry}), 201


@exercise_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_exercise_logs():
    """Get exercise logs with optional filtering."""
    db      = get_db()
    user_id = get_jwt_identity()
    limit   = int(request.args.get("limit", 30))
    days    = int(request.args.get("days", 7))  # Last N days
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    logs = list(db.exercise_logs.find({
        "user_id": user_id,
        "date": {"$gte": start_date}
    }).sort("date", -1).limit(limit))
    
    for log in logs:
        log["_id"] = str(log["_id"])
        log["date"] = log["date"].isoformat()
    
    # Calculate total burned
    total_burned = sum(log.get("calories_burned", 0) for log in logs)
    
    return jsonify({
        "logs": logs,
        "count": len(logs),
        "total_calories_burned": round(total_burned, 1),
        "days": days
    }), 200


@exercise_bp.route("/weekly-stats", methods=["GET"])
@jwt_required()
def weekly_stats():
    """Get weekly calorie burn breakdown."""
    db      = get_db()
    user_id = get_jwt_identity()
    
    # Last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    logs = list(db.exercise_logs.find({
        "user_id": user_id,
        "date": {"$gte": seven_days_ago}
    }))
    
    # Group by day
    daily_burns = {}
    for log in logs:
        day = log["date"].strftime("%a")  # Mon, Tue, Wed...
        daily_burns[day] = daily_burns.get(day, 0) + log.get("calories_burned", 0)
    
    # Ensure all 7 days present
    days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_data = [{"day": day, "calories_burned": round(daily_burns.get(day, 0), 1)} for day in days_order]
    
    total_burned = sum(daily_burns.values())
    avg_daily = total_burned / 7
    
    return jsonify({
        "weekly_data": weekly_data,
        "total_burned": round(total_burned, 1),
        "average_daily": round(avg_daily, 1),
        "most_active_day": max(daily_burns, key=daily_burns.get) if daily_burns else None
    }), 200