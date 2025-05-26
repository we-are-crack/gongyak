from flask import Flask
import logging
from logging.config import dictConfig

from app.routes.upload import upload_bp
from app.routes.query import query_bp
from app.routes.embed import embed_bp


def _configure_logging(level: str = "INFO") -> None:
    """전역 로깅 설정(한 번만 실행)."""
    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,       # 외부 라이브러리 로그 유지
        "formatters": {
            "default": {
                "format": "%(asctime)s  %(levelname)-8s [%(name)s] %(message)s",
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            }
        },
        "root": {                                # 최상위 로거
            "level": level,
            "handlers": ["console"],
        },
    })

def create_app():
    _configure_logging() 
    app = Flask(__name__)
    app.register_blueprint(upload_bp)
    app.register_blueprint(query_bp)
    app.register_blueprint(embed_bp)

    app.logger.info("Flask app created")
    return app
