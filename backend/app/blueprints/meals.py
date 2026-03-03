from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from ..database import get_db
from ..ml.meal_suggester import get_full_day_plan, search_meals, get_recipe_detail

meals_bp = Blueprint("meals", __name__)


@meals_bp.route("/day-plan", methods=["GET"])
@jwt_required()
def day_plan():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    target_calories = user.get("target_calories", 2000)
    diet_type       = request.args.get("diet_type") or user.get("diet_type", "non_veg")
    cuisine         = request.args.get("cuisine")   or user.get("cuisine_pref") or None

    plan = get_full_day_plan(target_calories, diet_type, cuisine)
    return jsonify({
        "target_calories": target_calories,
        "diet_type":       diet_type,
        "cuisine":         cuisine,
        "plan":            plan,
    }), 200


@meals_bp.route("/search", methods=["GET"])
@jwt_required()
def search():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})

    target_calories = float(request.args.get("calories", user.get("target_calories", 2000) if user else 2000))
    diet_type  = request.args.get("diet_type", "non_veg")
    cuisine    = request.args.get("cuisine")
    meal_type  = request.args.get("meal_type", "lunch")
    number     = int(request.args.get("number", 6))

    meals = search_meals(target_calories, diet_type, cuisine, meal_type, number)
    return jsonify({"meals": meals, "count": len(meals)}), 200


@meals_bp.route("/recipe/<int:recipe_id>", methods=["GET"])
@jwt_required()
def recipe_detail(recipe_id):
    detail = get_recipe_detail(recipe_id)
    if not detail:
        return jsonify({"error": "Recipe not found"}), 404
    return jsonify(detail), 200


@meals_bp.route("/log", methods=["POST"])
@jwt_required()
def log_meal():
    db      = get_db()
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}

    from datetime import datetime, timezone
    log_entry = {
        "user_id":        user_id,
        "meal_type":      data.get("meal_type", "lunch"),
        "meal_name":      data.get("meal_name", ""),
        "calories":       data.get("calories", 0),
        "protein":        data.get("protein", 0),
        "carbs":          data.get("carbs", 0),
        "fat":            data.get("fat", 0),
        "recipe_id":      data.get("recipe_id"),
        "date":           datetime.now(timezone.utc),
        "total_calories": data.get("calories", 0),
    }
    db.meal_logs.insert_one(log_entry)
    log_entry["_id"] = str(log_entry["_id"])
    return jsonify({"message": "Meal logged!", "log": log_entry}), 201


@meals_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_meal_logs():
    db      = get_db()
    user_id = get_jwt_identity()
    limit   = int(request.args.get("limit", 20))
    logs    = list(db.meal_logs.find({"user_id": user_id}).sort("date", -1).limit(limit))
    for log in logs:
        log["_id"] = str(log["_id"])
    return jsonify({"logs": logs, "count": len(logs)}), 200