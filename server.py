import os
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from jobpilot.config import (
    BASE_DIR, DATA_DIR, RESUMES_DIR, LINKEDIN_STORAGE_STATE,
    CANDIDATE_NAME, CANDIDATE_EMAIL, CANDIDATE_PHONE,
    CANDIDATE_LINKEDIN, CANDIDATE_LOCATION, CANDIDATE_WORK_AUTH,
    CANDIDATE_AVAILABILITY, CANDIDATE_TOTAL_EXP, CANDIDATE_EXPECTED_RATE,
    CANDIDATE_DEFAULT_TITLE, GMAIL_USER, GMAIL_APP_PASSWORD
)
from jobpilot.database import Database
from jobpilot.resume_parser import parse_resume, generate_linkedin_search_query
from jobpilot.linkedin_scraper import LinkedInScraper
from jobpilot.ai_customizer import customize_resume
from jobpilot.gmail_sender import compose_c2c_email, send_c2c_application
from jobpilot.pipeline import AutomationPipeline

app = FastAPI(
    title="JobPilot AI Automation API",
    description="Automated C2C LinkedIn Discovery, AI Resume Tailoring & Gmail Dispatcher",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()
scraper = LinkedInScraper(db)

# In-memory session state for UI convenience
CURRENT_RESUME_PATH = BASE_DIR / "sample_data" / "master_resume.txt"
ACTIVE_CANDIDATE = parse_resume(CURRENT_RESUME_PATH)

class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    work_authorization: Optional[str] = None
    job_title: Optional[str] = None

class CustomizeRequest(BaseModel):
    job: Dict[str, Any]

class SendEmailRequest(BaseModel):
    job: Dict[str, Any]
    pdf_filename: Optional[str] = None
    dry_run: Optional[bool] = True

@app.get("/api/status")
def get_system_status():
    stats = db.get_stats()
    return {
        "status": "online",
        "ai_engine": "active",
        "linkedin_authenticated": LINKEDIN_STORAGE_STATE.exists(),
        "gmail_configured": bool(GMAIL_APP_PASSWORD),
        "database": "connected",
        "stats": stats
    }

@app.get("/api/candidate")
def get_candidate_profile():
    return ACTIVE_CANDIDATE

@app.post("/api/candidate")
def update_candidate_profile(profile: CandidateProfileUpdate):
    global ACTIVE_CANDIDATE
    if profile.name: ACTIVE_CANDIDATE["candidate_name"] = profile.name
    if profile.email: ACTIVE_CANDIDATE["email"] = profile.email
    if profile.phone: ACTIVE_CANDIDATE["phone"] = profile.phone
    if profile.linkedin: ACTIVE_CANDIDATE["linkedin"] = profile.linkedin
    if profile.location: ACTIVE_CANDIDATE["location"] = profile.location
    if profile.work_authorization: ACTIVE_CANDIDATE["work_authorization"] = profile.work_authorization
    if profile.job_title:
        ACTIVE_CANDIDATE["job_title"] = profile.job_title
        ACTIVE_CANDIDATE["search_query"] = generate_linkedin_search_query(profile.job_title)
    return ACTIVE_CANDIDATE

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    global CURRENT_RESUME_PATH, ACTIVE_CANDIDATE
    uploads_dir = DATA_DIR / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    
    file_path = uploads_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = parse_resume(file_path)
        CURRENT_RESUME_PATH = file_path
        ACTIVE_CANDIDATE = parsed
        return {
            "message": "Resume uploaded and parsed successfully",
            "candidate": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")

@app.get("/api/jobs")
def get_jobs(search_query: Optional[str] = None, max_posts: int = 10, live: bool = False):
    query = search_query or ACTIVE_CANDIDATE.get("search_query", '"Java Developer" C2C')
    posts = scraper.search_c2c_posts(query, max_posts=max_posts, use_live_browser=live)
    return {
        "search_query": query,
        "count": len(posts),
        "duplicates_prevented": scraper.duplicates_prevented,
        "jobs": posts
    }

@app.post("/api/resume/customize")
def customize_job_resume(req: CustomizeRequest):
    job = req.job
    try:
        result = customize_resume(ACTIVE_CANDIDATE, job)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume customization failed: {str(e)}")

@app.get("/api/resumes/download/{filename}")
def download_resume(filename: str):
    file_path = RESUMES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume PDF not found")
    return FileResponse(
        str(file_path),
        media_type="application/pdf",
        filename=filename
    )

@app.post("/api/email/compose")
def compose_email(req: CustomizeRequest):
    email_data = compose_c2c_email(req.job, ACTIVE_CANDIDATE)
    return email_data

@app.post("/api/email/send")
def send_email_endpoint(req: SendEmailRequest):
    job = req.job
    pdf_name = req.pdf_filename
    if pdf_name:
        pdf_path = RESUMES_DIR / pdf_name
    else:
        # Generate on the fly
        customized = customize_resume(ACTIVE_CANDIDATE, job)
        pdf_path = Path(customized["pdf_path"])

    success, message = send_c2c_application(
        job_data=job,
        pdf_path=pdf_path,
        candidate_data=ACTIVE_CANDIDATE,
        db=db,
        dry_run=req.dry_run if req.dry_run is not None else True
    )

    return {
        "success": success,
        "message": message,
        "resume_pdf": pdf_path.name
    }

@app.get("/api/applications")
def get_applications(limit: int = 100):
    apps = db.get_applications(limit=limit)
    return apps

@app.get("/api/stats")
def get_statistics():
    return db.get_stats()

@app.post("/api/pipeline/run")
def run_pipeline_endpoint(max_jobs: int = 5, dry_run: bool = True, live: bool = False):
    pipeline = AutomationPipeline(resume_path=CURRENT_RESUME_PATH, db=db)
    report = pipeline.run(max_jobs=max_jobs, dry_run=dry_run, use_live_browser=live)
    return report

# Serve frontend static assets
app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
