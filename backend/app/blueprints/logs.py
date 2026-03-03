from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from ..database import get_db

logs_bp = Blueprint("logs", __name__)


@logs_bp.route("/", methods=["POST"])
@jwt_required()
def create_log():
    db      = get_db()
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}

    log = {
        "user_id":       user_id,
        "log_type":      data.get("log_type", "general"),   # meal | exercise | weight | general
        "title":         data.get("title", ""),
        "details":       data.get("details", {}),
        "calories":      data.get("calories", 0),
        "weight_kg":     data.get("weight_kg"),
        "notes":         data.get("notes", ""),
        "date":          datetime.now(timezone.utc),
    }
    result = db.user_logs.insert_one(log)
    log["_id"] = str(result.inserted_id)
    log["date"] = log["date"].isoformat()

    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"total_logs": 1}})
    return jsonify({"message": "Logged!", "log": log}), 201


@logs_bp.route("/", methods=["GET"])
@jwt_required()
def get_logs():
    db       = get_db()
    user_id  = get_jwt_identity()
    log_type = request.args.get("type")
    limit    = int(request.args.get("limit", 30))

    query = {"user_id": user_id}
    if log_type:
        query["log_type"] = log_type

    logs = list(db.user_logs.find(query).sort("date", -1).limit(limit))
    for log in logs:
        log["_id"]  = str(log["_id"])
        log["date"] = log["date"].isoformat()

    return jsonify({"logs": logs, "count": len(logs)}), 200


@logs_bp.route("/<log_id>", methods=["DELETE"])
@jwt_required()
def delete_log(log_id):
    db      = get_db()
    user_id = get_jwt_identity()
    result  = db.user_logs.delete_one({"_id": ObjectId(log_id), "user_id": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Log not found"}), 404
    return jsonify({"message": "Log deleted"}), 200