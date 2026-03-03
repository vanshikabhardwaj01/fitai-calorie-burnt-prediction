from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
)
from datetime import datetime, timezone
from bson import ObjectId
from ..database import get_db
from .. import bcrypt
from ..ml.calorie_engine import build_health_profile

auth_bp = Blueprint("auth", __name__)


def _user_to_dict(user: dict) -> dict:
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return user


@auth_bp.route("/signup", methods=["POST"])
def signup():
    db = get_db()
    data = request.get_json(silent=True) or {}

    required = ["email", "username", "password", "age", "weight_kg", "height_cm", "gender"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if db.users.find_one({"email": data["email"].lower()}):
        return jsonify({"error": "Email already registered"}), 409
    if db.users.find_one({"username": data["username"]}):
        return jsonify({"error": "Username already taken"}), 409

    # Build health profile
    profile = build_health_profile({
        "age":            data["age"],
        "weight_kg":      data["weight_kg"],
        "height_cm":      data["height_cm"],
        "gender":         data.get("gender", "male"),
        "activity_level": data.get("activity_level", "moderately_active"),
        "goal":           data.get("goal", "maintenance"),
    })

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = {
        "email":          data["email"].lower(),
        "username":       data["username"],
        "password":       hashed_pw,
        "full_name":      data.get("full_name", data["username"]),
        "age":            int(data["age"]),
        "weight_kg":      float(data["weight_kg"]),
        "height_cm":      float(data["height_cm"]),
        "gender":         data.get("gender", "male"),
        "activity_level": data.get("activity_level", "moderately_active"),
        "goal":           data.get("goal", "maintenance"),
        "diet_type":      data.get("diet_type", "non_veg"),
        "cuisine_pref":   data.get("cuisine_pref", ""),
        # computed health stats
        "bmi":            profile.bmi,
        "bmi_category":   profile.bmi_category,
        "bmr":            profile.bmr,
        "tdee":           profile.tdee,
        "target_calories":profile.target_calories,
        "body_fat_est":   profile.body_fat_est,
        "ideal_weight_min": profile.ideal_weight_min,
        "ideal_weight_max": profile.ideal_weight_max,
        "macros":         profile.macros,
        "created_at":     datetime.now(timezone.utc),
        "updated_at":     datetime.now(timezone.utc),
        "streak":         0,
        "total_logs":     0,
    }

    result  = db.users.insert_one(new_user)
    user_id = str(result.inserted_id)

    access_token  = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    new_user["_id"] = user_id
    new_user.pop("password")
    return jsonify({
        "message":       "Account created successfully!",
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user":          new_user,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    db   = get_db()
    data = request.get_json(silent=True) or {}

    identifier = data.get("email") or data.get("username")
    password   = data.get("password")
    if not identifier or not password:
        return jsonify({"error": "Email/username and password required"}), 400

    user = (
        db.users.find_one({"email": identifier.lower()}) or
        db.users.find_one({"username": identifier})
    )
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    user_id = str(user["_id"])
    access_token  = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return jsonify({
        "message":       "Login successful!",
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user":          _user_to_dict(user),
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id      = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    db      = get_db()
    user_id = get_jwt_identity()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_user_to_dict(user)), 200