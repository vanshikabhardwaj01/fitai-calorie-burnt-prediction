from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from ..database import get_db
from ..ml.exercise_recommender import get_exercises_by_goal, get_workout_plan, search_exercise_by_name

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
    data    = request.get_json(silent=True) or {}

    log_entry = {
        "user_id":        user_id,
        "exercise_name":  data.get("exercise_name", ""),
        "sets_completed": data.get("sets_completed", 0),
        "reps_completed": data.get("reps_completed", 0),
        "duration_min":   data.get("duration_min", 0),
        "calories_burned":data.get("calories_burned", 0),
        "notes":          data.get("notes", ""),
        "date":           datetime.now(timezone.utc),
    }
    db.exercise_logs.insert_one(log_entry)
    log_entry["_id"] = str(log_entry["_id"])

    # Update streak
    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"streak": 1, "total_logs": 1}})
    return jsonify({"message": "Exercise logged!", "log": log_entry}), 201