import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root if present
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Storage paths
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
RESUMES_DIR = BASE_DIR / "resumes_generated"
RESUMES_DIR.mkdir(exist_ok=True)
SESSIONS_DIR = BASE_DIR / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "jobpilot.db"
LINKEDIN_STORAGE_STATE = SESSIONS_DIR / "linkedin_storage_state.json"

# Candidate Profile Defaults
CANDIDATE_NAME = os.getenv("CANDIDATE_NAME", "Alex Morgan")
CANDIDATE_EMAIL = os.getenv("CANDIDATE_EMAIL", "alex.morgan@email.com")
CANDIDATE_PHONE = os.getenv("CANDIDATE_PHONE", "+1 (555) 123-4567")
CANDIDATE_LINKEDIN = os.getenv("CANDIDATE_LINKEDIN", "https://www.linkedin.com/in/alexmorgan")
CANDIDATE_LOCATION = os.getenv("CANDIDATE_LOCATION", "Dallas, TX")
CANDIDATE_WORK_AUTH = os.getenv("CANDIDATE_WORK_AUTH", "US Citizen")
CANDIDATE_AVAILABILITY = os.getenv("CANDIDATE_AVAILABILITY", "Immediate / 2 weeks")
CANDIDATE_TOTAL_EXP = os.getenv("CANDIDATE_TOTAL_EXP", "8+ Years")
CANDIDATE_EXPECTED_RATE = os.getenv("CANDIDATE_EXPECTED_RATE", "$75 - $85/hr (Negotiable)")
CANDIDATE_DEFAULT_TITLE = os.getenv("CANDIDATE_DEFAULT_TITLE", "Java Developer")

# AI API Configurations
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Gmail / Email Configurations
GMAIL_USER = os.getenv("GMAIL_USER", CANDIDATE_EMAIL)
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))

# LinkedIn Configurations
LINKEDIN_HEADLESS = os.getenv("LINKEDIN_HEADLESS", "true").lower() in ("true", "1", "yes")
LINKEDIN_USERNAME = os.getenv("LINKEDIN_USERNAME", "")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD", "")

def get_candidate_summary_dict():
    return {
        "Candidate Name": CANDIDATE_NAME,
        "Email": CANDIDATE_EMAIL,
        "Phone": CANDIDATE_PHONE,
        "LinkedIn Profile": CANDIDATE_LINKEDIN,
        "Current Location": CANDIDATE_LOCATION,
        "Work Authorization": CANDIDATE_WORK_AUTH,
        "Availability": CANDIDATE_AVAILABILITY,
        "Total Experience": CANDIDATE_TOTAL_EXP,
        "Expected Salary": CANDIDATE_EXPECTED_RATE
    }
