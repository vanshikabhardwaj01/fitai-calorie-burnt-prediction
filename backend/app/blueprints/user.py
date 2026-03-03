from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from ..database import get_db
from ..ml.calorie_engine import build_health_profile, get_health_tips

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return jsonify(user), 200


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    db      = get_db()
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}

    # Fetch current user to fill missing fields
    current = db.users.find_one({"_id": ObjectId(user_id)})
    if not current:
        return jsonify({"error": "User not found"}), 404

    updatable = [
        "full_name", "age", "weight_kg", "height_cm", "gender",
        "activity_level", "goal", "diet_type", "cuisine_pref",
    ]
    update_data = {k: data[k] for k in updatable if k in data}

    # Re-calculate health profile if body metrics changed
    metric_keys = {"age", "weight_kg", "height_cm", "gender", "activity_level", "goal"}
    if metric_keys & set(update_data.keys()):
        merged = {**{k: current.get(k) for k in ["age","weight_kg","height_cm","gender","activity_level","goal"]}, **update_data}
        profile = build_health_profile(merged)
        update_data.update({
            "bmi":            profile.bmi,
            "bmi_category":   profile.bmi_category,
            "bmr":            profile.bmr,
            "tdee":           profile.tdee,
            "target_calories":profile.target_calories,
            "body_fat_est":   profile.body_fat_est,
            "ideal_weight_min": profile.ideal_weight_min,
            "ideal_weight_max": profile.ideal_weight_max,
            "macros":         profile.macros,
        })

    update_data["updated_at"] = datetime.now(timezone.utc)
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    updated["_id"] = str(updated["_id"])
    updated.pop("password", None)
    return jsonify({"message": "Profile updated!", "user": updated}), 200


@user_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Build profile & tips
    profile = build_health_profile({
        "age":            user.get("age", 25),
        "weight_kg":      user.get("weight_kg", 70),
        "height_cm":      user.get("height_cm", 170),
        "gender":         user.get("gender", "male"),
        "activity_level": user.get("activity_level", "moderately_active"),
        "goal":           user.get("goal", "maintenance"),
    })
    tips = get_health_tips(profile)

    # Aggregate logs
    total_calories = 0
    logs = list(db.meal_logs.find({"user_id": user_id}).sort("date", -1).limit(7))
    for log in logs:
        total_calories += log.get("total_calories", 0)

    saved_workouts_count = db.saved_workouts.count_documents({"user_id": user_id})
    total_logs           = db.user_logs.count_documents({"user_id": user_id})

    return jsonify({
        "bmi":               profile.bmi,
        "bmi_category":      profile.bmi_category,
        "bmr":               profile.bmr,
        "tdee":              profile.tdee,
        "target_calories":   profile.target_calories,
        "body_fat_est":      profile.body_fat_est,
        "ideal_weight_min":  profile.ideal_weight_min,
        "ideal_weight_max":  profile.ideal_weight_max,
        "macros":            profile.macros,
        "health_tips":       tips,
        "weekly_avg_calories": round(total_calories / max(len(logs), 1), 1),
        "saved_workouts":    saved_workouts_count,
        "total_logs":        total_logs,
        "streak":            user.get("streak", 0),
    }), 200