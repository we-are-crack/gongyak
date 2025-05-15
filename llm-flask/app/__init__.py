from flask import Flask
from app.routes.upload import upload_bp
from app.routes.query import query_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(upload_bp)
    app.register_blueprint(query_bp)

    return app
