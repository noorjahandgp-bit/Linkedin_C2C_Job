import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from jobpilot.config import BASE_DIR, RESUMES_DIR
from jobpilot.database import Database
from jobpilot.resume_parser import parse_resume
from jobpilot.linkedin_scraper import LinkedInScraper
from jobpilot.ai_customizer import customize_resume
from jobpilot.gmail_sender import compose_c2c_email, send_c2c_application

class AutomationPipeline:
    def __init__(
        self,
        resume_path: Optional[Path] = None,
        db: Optional[Database] = None
    ):
        self.resume_path = resume_path or (BASE_DIR / "sample_data" / "master_resume.txt")
        self.db = db or Database()
        self.scraper = LinkedInScraper(self.db)

    def run(
        self,
        max_jobs: int = 5,
        dry_run: bool = True,
        use_live_browser: bool = False
    ) -> Dict[str, Any]:
        """
        Executes the complete 7-step automation workflow:
        1. Parse Resume & Generate Search Query
        2. Search LinkedIn Posts (Last 24h, C2C only)
        3. Analyze & Extract Recruiter & Job Info
        4. AI Resume Customization (90-95% truthful match)
        5. Recruiter Information Enhancement
        6. Compose Standardized Email
        7. Send Email & Record Submission (Deduplication)
        """
        report = {
            "started_at": datetime.now().isoformat(),
            "candidate_profile": {},
            "search_query": "",
            "jobs_found": 0,
            "jobs_processed": [],
            "duplicates_prevented": 0,
            "applications_sent": 0,
            "status": "completed"
        }

        # Step 1 & 2: Parse Resume & Get Query
        candidate_data = parse_resume(self.resume_path)
        search_query = candidate_data["search_query"]
        report["candidate_profile"] = {
            "name": candidate_data["candidate_name"],
            "title": candidate_data["job_title"],
            "email": candidate_data["email"],
            "phone": candidate_data["phone"]
        }
        report["search_query"] = search_query

        # Step 2 & 3: Search & Extract Relevant Jobs
        posts = self.scraper.search_c2c_posts(
            search_query=search_query,
            max_posts=max_jobs,
            use_live_browser=use_live_browser
        )
        report["duplicates_prevented"] += self.scraper.duplicates_prevented
        report["jobs_found"] = len(posts)

        for job in posts:
            post_url = job.get("post_url", "")
            recruiter_email = (job.get("recruiter_email") or "").strip()

            # Pre-check duplicates
            if self.db.is_post_processed(post_url):
                report["duplicates_prevented"] += 1
                continue
            if recruiter_email and self.db.is_recruiter_contacted(recruiter_email, within_days=30):
                report["duplicates_prevented"] += 1
                continue

            # Step 4 & 5: AI Resume Customization & Recruiter Enhancement
            customized = customize_resume(candidate_data, job)
            pdf_path = Path(customized["pdf_path"])
            recruiter_details = customized.get("recruiter_enhancement", {})

            # Step 6: Compose Email
            email_data = compose_c2c_email(job, candidate_data, recruiter_details)

            # Step 7: Send Email & Record Submission
            success, message = send_c2c_application(
                job_data=job,
                pdf_path=pdf_path,
                candidate_data=candidate_data,
                recruiter_details=recruiter_details,
                db=self.db,
                dry_run=dry_run
            )

            job_summary = {
                "title": job.get("title"),
                "company": job.get("company"),
                "recruiter": job.get("recruiter"),
                "recruiter_email": recruiter_email,
                "match_score": customized.get("match_score", 94),
                "resume_pdf": customized.get("pdf_filename"),
                "email_subject": email_data["subject"],
                "status": "Sent" if success else "Skipped/Failed",
                "message": message
            }
            report["jobs_processed"].append(job_summary)
            if success:
                report["applications_sent"] += 1

        report["completed_at"] = datetime.now().isoformat()
        return report
