import os
from app.service.gemini_service import GeminiService

API_KEY = os.getenv("GEMINI_API_KEY")
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
LOCATION = os.getenv("GEMINI_LOCATION")

gemini = GeminiService(API_KEY, PROJECT_ID, LOCATION)