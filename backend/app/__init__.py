from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from .config import Config
from .database import init_db

bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Database
    init_db(app)

    # Blueprints
    from .blueprints.auth import auth_bp
    from .blueprints.user import user_bp
    from .blueprints.meals import meals_bp
    from .blueprints.exercise import exercise_bp
    from .blueprints.dashboard import dashboard_bp
    from .blueprints.logs import logs_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(user_bp,      url_prefix="/api/user")
    app.register_blueprint(meals_bp,     url_prefix="/api/meals")
    app.register_blueprint(exercise_bp,  url_prefix="/api/exercise")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(logs_bp,      url_prefix="/api/logs")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "FitAI Backend Running 🚀"}

    return app